#pragma once
//THe purpose of this file is strictly for the personal ID number creation
//Responses in the Source code (Source 1) will determine the ID number

//First 3 digits: Classification(Admins, B.Manager, Researcher, Professor)
//Building Manager : 500  | Dean : 400  | Admins : 300  | Researchers : 200 | Professors : 100
//Middle 2 digits : define building limitations
//Martin : 22 | Monroe : 21 | McNair : 87 | Graham : 39
//Last 3 digits : Requester office number(serves as a unique identifier)

//Example Building Manager Bethea's ID is: 50022215
#include <iostream>
#include <string>
#include <map>

using namespace std;
/*cout << "What number is your office?"
	cin >> officeNumber;*/

string userRole;
string classification;
string userBuilding;

int main() {
	//maps to assign the ID number
	map<string, string> classificationNum = { {"500", "Manager"}, {"300", "Admin"}, {"200", "Researcher"}, {"100", "Professor"} };
	map<string, string> building = { {"22", "Martin"}, {"21", "Monroe"}, {"87", "McNair"}, {"39", "Graham"} };
	//office number provide by user in source code
	string officeNumber;
	string userID;

}


void userRoleClassification() {
	if (userRole == "Manager") {
		classification = "500";
	}
	if (userRole == "Admin") {
		classification = "300";
	}
	if (userRole == "dean") {
		classification = "400";
	}
	if (userRole == "Researcher") {
		classification = "200";
	}
	if (userRole == "Professor") {
		classification = "100";
	}
}
void userBuildingClassification() {
	if (userBuilding == "Martin") {
		classNumber = "22";
	}
	if (userBuilding == "Monroe") {
		classNumber = "21";
	}
	if (userBuilding == "McNair") {
		classNumber = "87";
	}
	if (userBuilding == "Graham") {
		classNumber = "39";
	}
}
//Eventually, we'd turn userID into a integer so we can create a hierarchy system
//e.g. if userNum is greater than 40000000 then they can request more rooms than someone who's number is less than that
userID = classNumber + buildingNumber + officeNumber;
cout << "Your ID number is " << officeNumber << endl;
