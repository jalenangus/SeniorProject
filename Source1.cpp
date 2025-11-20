#include <iostream>
#include <map>
#include <string>
using namespace std;

pubic int userAssignment = 0; 
string userRole; 


int main() {
	//Library of variables
	//The managers and deans have their own variable
	string martinManager = "Bethea";
	string engineeringManager = "Houge";
	string engineeringDean = "Luster-Teasley";
	string userRole;

	//Once user ID info this is sent to facultyID in order to create the unique ID
	map<string, int> userBuilding = { {"Martin", 1}, {"Monroe", 2 }, {"McNair", 3}, {"Graham", 3} };
	string manager;
	string userBuilding;
	map<string, int> assignment = { {"Building Manager", 1}, {"Admin", 2}, {"Researcher", 3}, {"Professor", 4} };

	//The chairs of each engineering deaprtment are listed in the database already
	//Request for the title assignment certification will go to the Chairs
	//This is to avoid coding in each and every faculty member
	map<string, string> chair = { {"CBBE", "Lou"}, {"CAEE", "Jha"}, {"CS","Roy"}, {"ECE", "Kelly"}, {"MEEN", "Kizito"}. {"ISE", "Yadav"} };
	map<string, string> email = { {"CBBE", "lou@ncat.edu"}, {"CAEE", "mkjha@ncat.edu"}, {"CS","kroy@ncat.edu"}, {"ECE", "jck@ncat.edu"}, {"MEEN", "jpkizito@ncat.edu"}, {"ISE", "oyadav@ncat.edu"} };

	//To create the last 3 unique numbers
	string userOfficeNumber;

	//To see if the chair approved the accuracy of the information
	bool approval = false;

	//assigns user classification to their account
	//this is entered in through the website
	cout << "Select your classification: ";
	cout << "Please note this will be verified by your chair.";
	cin >> userRole;
	int userClassification() {
		if (userRole == "Building Manager") {
			titleAssignment(1);
		}
		if (userRole == "admin") {
			titleAssignment(2)
		}
		if (userRole == "researcher") {
			titleAssignment(3)
		}
		if (userRole == "professor") {
			titleAssignment(4)
		}
	}
	cout << "Select your building: ";
	cin >> userBuilding;
	

	cout << "Select your building: ";
	cin >> userBuilding;
	int buildingAssignment() {
		if (userBuilding == "Martin") {
			userBuilding = userBuildingArray.at[0];
		}
		if (userBuilding == "Monroe") {
			userBuilding = userBuildingArray.at[1];
		}
		if (userBuilding == "McNair") {
			userBuilding = userBuildingArray.at[2];
		}
		if (userBuilding == "Graham") {
			userBuilding = userBuildingArray.at[3];
		}

	}


	cout << "What is your office number?";
	cin >> userOfficeNumber;
	//Sends email to chair to comfirm: void chairEmail() {}

	//if the user is approved it calls faculty ID to make them a unique idenitifier 
	if (approval = true) {
		facultyID.cpp
	}

	//assigns building manager to them for request
	if (userBuildingArray[0]) {
		manager = martinManager;
	}
	else {
		manager = engineeringManager;
	}
}



