#include <iostream>
#include <map>
#include <string>
#include <sqlite3.h>



using namespace std;


int main() {
	cout << "Please note all information will be verified by your chair.";
	bool approval = true;
	string userRole = userClassification();
	string userBuilding = buildingAssignment();
	string userOffice = userOfficeNumber();

	//if the user is approved it calls faculty ID to make them a unique idenitifier 
	if (approval == true) {
		userIDCreation();
	}
	else if (approval == false) {
		//Sends email of their denial
		cout << "Sorry you were not approved by your chair";
	}

}

//The follwoing methods collect information from the user to assign classification to their account
//This is entered in through the website


string userClassification() {
	string userRole;

	cout << "Select your classification: ";
	cin >> userRole;
	return userRole;
}
string userOfficeNumber() {
	string userOffice;
	cout << "Select your classification: ";
	cin >> userOffice;
	return userOffice;
}

string buildingAssignment() {
	string userBuilding;
	cout << "Select your building: ";
	cin >> userBuilding;
	return userBuilding;
}

//office number provide by user in source code
string userIDCreation(const string& userBuilding, const string& userClassification) {
	splite3* dbpointer;
	sqlite3_stmt* stmt;
	string classification = "000";
	string buildingNumber = "000";


	if (sqlite3_open("roomrequestdb.sql", &dbpointer) == SQLITE_OK){
		string sql = "SELECT building_ID_Code FROM buildings WHERE building = ?;";
		if (sqlite3_prepare_v2(dbpointer, sql.c_str(), -1, &stmt, nullptr) == SQLITE_OK) {
			sqlite3_bind_text(stmt, 1, buildingName.c_str(), -1, SQLITE_STATIC);

			if (sqlite3_step(stmt) == SQLITE_ROW) {
				buildingCode = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0));
			}
		}
		sqlite3_finalize(stmt);
		sqlite3_close(dbpointer);
		}

		string classification = userRoleClassification();
		string buildingNumber = userBuildingClassification();
		srting officeNumber = userOfficeNumber();
		string userID;
		userID = classification + buildingNumber + officeNumber;
		return userID;
	}


	
	




