/*
Title : Forestry schedule inspection for each tree in list (ApplicationSpecificInfoUpdateAfter) 
Purpose : check if there is an inspection for each Tree Id, schedule one if needed

Author: Yazan Barghouth 
 
Functional Area : Records

Sample Call:
	checkAndScheduleInspectionPerTreeId("Forestry Inspection", "FORESTRY INSPECTOR", "TREE INFORMATION");
	
Notes:
	- ASIT name is 'TREE INFORMATION', 'TREE INVENTORY' is the alias
	- Checklist name is 'FORESTRY INSPECTOR' not 'FORESTRY INSPECTION'
	- Inspection scheduled on nextWorkday() from NOW
*/

checkAndScheduleInspectionPerTreeId("Forestry Inspection", "FORESTRY INSPECTOR", "TREE INFORMATION");
