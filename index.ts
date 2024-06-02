#! /usr/bin/env node
import inquirer from "inquirer";
import chalk from "chalk";
import { printTable, Table } from "console-table-printer";
import * as admission from "./add_student.js";
import * as enrollment from "./enroll_student.js"
const positiveNotification=chalk.bgHex('#6aa84f').black,negativeNotification=chalk.bgHex('#e14747').black
,heading=chalk.bgHex('#3d85c6').hex('#000000');
export let stdntIdies:unknown[]=[];
let stdntAllCourses:[{ID:string,Name:string,All_Courses:string[]}]=[{ID:'',Name:'',All_Courses:[]}];
const courses:{[key:string]:number} ={Arabic:750,English:350,German:550,Italian:400,Persian:650}
    , studentDatabase:any[]=[];
export interface StdntDetailsFormat{
    ID:string,
    Name:string,
    Age:string,
    Gender:string,
    Dues:string,
    Course?:string
    }
const showStdntData = (id:unknown)=>{
    let identifiedStdntObjtIndex=studentDatabase.findIndex(objt=> objt.Name===id || objt.ID===String(id));
    let stdntOject=studentDatabase[identifiedStdntObjtIndex];
    if(stdntOject!==undefined){
        const myTable = new Table();
        let rowObject = {'Student ID':stdntOject.ID,'Student Name':stdntOject.Name,
        Age:stdntOject.Age,Dues:stdntOject.Dues}
        if(stdntOject.Course!==undefined){
            rowObject=Object.assign({},rowObject,{Course:stdntOject.Course});
        }
        myTable.addRow(rowObject);
        myTable.printTable();
    }else{
        return console.log('\tNo Record Found!');
    }
};
// getting identified student 
const selectStudent = async (toPay?:boolean,forStatus?:boolean)=>{
    let stdntSelected:any, 
    selectStdntAgain,quiteCase=false,firstIteration=true;
    if(toPay===true){firstIteration=false;}
    do{
        let isFound=['',''];
        if(firstIteration===true){
            stdntSelected = await enrollment.selectStudent(false,firstIteration);
            isFound=studentDatabase.filter(elementObjt=>elementObjt.Name===stdntSelected || elementObjt.ID===stdntSelected);
        }
        if(isFound.length>1){
            if(forStatus===true && isFound[0]!==''){
                return isFound;
            }else{
                stdntSelected=await enrollment.selectStudent(true,firstIteration);
                isFound=studentDatabase.filter(elementObject=>elementObject.ID===stdntSelected);
            }
            if(isFound.length===0){
                console.log('\tNo Record Found!');
                let askUser = await enrollment.nowWhat();
                if(askUser===false){quiteCase=true;}
            }
        }else if(isFound.length===0){
            console.log(negativeNotification('\t No Record Found! '));
            let askUser = await enrollment.nowWhat();
            if(askUser===false){quiteCase=true;}
        }
        selectStdntAgain=isFound.length;
        firstIteration=false;
    }while(selectStdntAgain!==1 && quiteCase===false)
    if(quiteCase===true){return 0;}
    return stdntSelected;
};
let runAgain=true;
do{
    // fetching existing Idies
    studentDatabase.forEach(elementObject=>{
        stdntIdies.push(elementObject.ID);
    });
    const mainMenu = await inquirer.prompt({
        name:'option',
        type:'list',
        choices:['Student Status','Admit Student','Enroll Student',
        'Pay Fee (get ID from Status first)','Certify Student','Exit'],
        default:'Admit Student',
        message:heading('\n\t Main Menu ')
    });
    switch(mainMenu.option){
        case 'Admit Student':
            let askForAnotherStudent,stdntObjct,multipleAdmission=[];
            do{
                stdntObjct = await admission.addStudent();
                studentDatabase.push(stdntObjct);
                stdntIdies.push(Object.values(stdntObjct)[0]);
                multipleAdmission.push(stdntObjct);
                askForAnotherStudent = await admission.addAnotherStudent();
            }
            while(askForAnotherStudent)
            printTable(multipleAdmission)
            break;
        case 'Student Status':            
            let statusOf = await selectStudent(undefined,true);
            if(typeof statusOf==='object' && statusOf!==0){
                printTable(statusOf);
            }else if(statusOf!==0){
                showStdntData(statusOf);
            }
            break;
        case 'Enroll Student':
            let enrolmntStudent= await selectStudent();
            if(enrolmntStudent===0)break;
            let duesPaid =true;
            const sltdStdntIndex = studentDatabase.findIndex(elementObjt => elementObjt.Name === enrolmntStudent || elementObjt.ID === String(enrolmntStudent));
            let selectedStdntObject=studentDatabase[sltdStdntIndex];
            if(selectedStdntObject.Dues!=='Paid'){
                console.log(negativeNotification(`\t Disable to proceed as ${selectedStdntObject.Dues} is not paid! `));
                duesPaid=false;
            }else{
                let selectedCourse = await enrollment.askCourse(courses);
                let enrollmentFee = courses[selectedCourse];
                selectedStdntObject.Course=selectedCourse;
                let foundInAllCoursesIndex=stdntAllCourses.findIndex(objt => objt.ID===selectedStdntObject.ID && objt.Name===selectedStdntObject.Name);
                if(foundInAllCoursesIndex===-1){
                    let stdntAllCoursesObject = {
                        ID:selectedStdntObject.ID,
                        Name:selectedStdntObject.Name,
                        All_Courses:[selectedCourse]
                    }
                    stdntAllCourses.push(stdntAllCoursesObject)
                }else{
                    stdntAllCourses[foundInAllCoursesIndex].All_Courses.push(selectedCourse);
                }
                selectedStdntObject.Dues='Enrollment: '+enrollmentFee.toString();
                console.log(positiveNotification(`\t ${selectedStdntObject.Name} is enrolled in ${selectedCourse} `));
            }
            if(duesPaid===true){showStdntData(enrolmntStudent);}
            break;
        case 'Pay Fee (get ID from Status first)':
            let theStudent = await selectStudent(true);
            let studentObjct={Name:'',Dues:''};
            studentDatabase.forEach(elementObject=>{
                if(elementObject.ID===theStudent){
                    studentObjct=elementObject;
                }
            })
            if(studentObjct.Dues!=='Paid' && theStudent!==0){
                console.log(chalk.underline('\tDues')+'\n'+studentObjct.Dues);
                let duesString = studentObjct.Dues,fetchDues='';
                for(let i=duesString.length-4;i<duesString.length;i++){
                    fetchDues+=duesString.charAt(i);
                }
                let dueAmount = Number(fetchDues);
                let payAgain=false;
                do{
                    payAgain=false;
                    const askAmount = await inquirer.prompt({
                        name:'value',type:'number',
                        message:'Payment Amount: '
                    });
                    if(askAmount.value-dueAmount>0){
                        console.log(positiveNotification(`\t ${dueAmount} is Paid! `));
                        console.log(`\tHere's your change ${askAmount.value-dueAmount}`);
                        studentObjct.Dues='Paid';
                    }else if(askAmount.value==dueAmount){
                        console.log(positiveNotification(`\t Payment Confirmed! `));
                        studentObjct.Dues='Paid';
                    }else{
                        console.log(negativeNotification('\t Insufficient Payment! ' ));
                        payAgain = await enrollment.nowWhat();
                    }
                }while(payAgain===true)
            }else if(theStudent!==0){
                console.log(positiveNotification(`\t ${studentObjct.Name} have all dues Paid! `))
            }
            break;
        case 'Certify Student':
            let identifiedStdnt = await selectStudent();
            if(identifiedStdnt===0)break;
            let stdntObjtIndex = studentDatabase.findIndex(objt => objt.ID===String(identifiedStdnt) || objt.Name===identifiedStdnt);
            const stdntDetais = studentDatabase[stdntObjtIndex];
            let allCousesStdntObjtIndex = stdntAllCourses.findIndex(objt => objt.ID===String(identifiedStdnt) || objt.Name===identifiedStdnt);
            let allCousesStdntObjt = stdntAllCourses[allCousesStdntObjtIndex];
            if(stdntDetais.Dues==='Paid' && allCousesStdntObjt!==undefined){
                console.log(heading(`\t\t\t XYZ Institute \n`));
                let allCourses = allCousesStdntObjt.All_Courses;
                let noDuplicateCourses = allCourses.filter((item:string,index:unknown)=>{
                    return allCourses.indexOf(item)===index
                })
                let certifcateText;
                if(noDuplicateCourses.length===1){
                    certifcateText='\t Acknowledge that '+ chalk.blueBright(stdntDetais.Name) 
                    + ' has successfully completed '+ chalk.blueBright(noDuplicateCourses) +' language course. ';
                }else{
                    certifcateText='\t Acknowledge that '+ chalk.blueBright(stdntDetais.Name)
                    + ' has successfully completed following language courses:'+'\n\t'+chalk.blueBright(noDuplicateCourses);
                }
                console.log(positiveNotification(certifcateText)); 
                stdntAllCourses.splice(allCousesStdntObjtIndex,1);
            }else{
                if(stdntDetais.Dues!=='Paid'){
                    console.log(negativeNotification(`\t ${stdntDetais.Name} have ${stdntDetais.Dues} pending! `));
                }else{
                    console.log(negativeNotification(`\t ${stdntDetais.Name} has not completed any course successfully! `)); 
                } 
            }
            break;
        case 'Exit':
            runAgain=false;
            break;
        default://given just to practice complete switch-statement syntax
    };
}while(runAgain)