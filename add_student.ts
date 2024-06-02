import inquirer from "inquirer";
import {stdntIdies, StdntDetailsFormat} from "./index.js"

const generateUniqueId =(idies:any[]):string=>{
    let idString='';
    do{
        const idCharacters ='0123456789';
        for(let i=0;i<5;i++){
            idString+=idCharacters.charAt(Math.floor(Math.random()*idCharacters.length));
            if(idString.charAt(0)==='0'){
                idString='';
                i--;
            }
        }
    }
    while(idies.includes(idString))
    return idString;
};
export const titleCaseName =(stdntName:string):string=>{
    let correctCaseName='';
    if(stdntName.includes(' ') || stdntName.includes('\t')){
        stdntName=stdntName.replace(/\t/g,' ');
        let nameArray = stdntName.split(' ');
        nameArray.forEach(elementValue=>{
            if(elementValue.charAt(0) && elementValue!==nameArray[0]){
                correctCaseName+=' ';
            }
            correctCaseName+=elementValue.charAt(0).toUpperCase()+elementValue.slice(1).toLowerCase();
        })
    }else{
        correctCaseName+=stdntName.charAt(0).toUpperCase()+stdntName.slice(1).toLowerCase();
    }
    return correctCaseName;
}
export const addStudent = async ():Promise<object> => {
    const stdntDetailsInquiry = await inquirer.prompt([
        {
            name:'Name',
            type:'input',
            messAge:'Name:',
            filter:(input)=>input.trim(),
            validate:(input)=>{
                if(/^[A-Za-z ]+$/.test(input)){
                    return true;
                }
                return 'Please provide value in Alphabets only!'
            }
        },
        {
            name:'Age',
            type:"input",
            messAge:'Age:',
            validate:(input)=>{
                if(/^\d{2}$/.test(input) && Number(input)<66){
                    return true;
                }
                return 'Please provide valid Age(10-65)';
            }
        },
        {
            name:'Gender',
            type:"list",choices:['Male','Female'],
            messAge:'Gender'
        }
    ]);
    const stdntInfo:StdntDetailsFormat={
        ID:generateUniqueId(stdntIdies),
        Name:titleCaseName(stdntDetailsInquiry.Name),
        Age:stdntDetailsInquiry.Age,
        Gender:stdntDetailsInquiry.Gender,
        Dues:'Admission Fee: 1200'
    };
    return stdntInfo;
};
export const addAnotherStudent = async ():Promise<string> => {
    const anotherStudentInquiry = await inquirer.prompt({
        name:'addMore',
        type:'confirm',
        message:'Do you want to add more Students?'
    });
    return anotherStudentInquiry.addMore;
};