import inquirer from "inquirer";
import { titleCaseName } from "./add_student.js";
export const selectStudent = async (selectingAgain, firstIteration) => {
    let messageText = 'Please provide Student Full Name / ID:';
    if (selectingAgain === true) {
        if (firstIteration === true) {
            console.log('\tFound multiple Students with same names!');
        }
        messageText = 'Enter Student ID :';
    }
    const stdntName = await inquirer.prompt({
        name: 'name',
        type: 'input',
        message: messageText
    });
    return titleCaseName(stdntName.name);
};
export const askCourse = async (courses) => {
    const userCourse = await inquirer.prompt({
        name: "Course", type: 'list', choices: Object.keys(courses),
        message: 'Select Course:'
    });
    return userCourse.Course;
};
export const nowWhat = async () => {
    const askUser = await inquirer.prompt({
        name: 'ans', type: 'confirm', message: 'Do you want to Try Again?'
    });
    return askUser.ans;
};
