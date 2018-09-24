/* Title :  Cancel Forestry Inspection (ApplicationSpecificInfoUpdateAfter)

Purpose :  When Custom List TREE INVENTORY is saved, check Tree ID for matching scheduled Forestry Inspections and if there is
a Forestry Inspection with a Tree ID(Tree ID will be in the inspection Unit Number field) that is not in the custom list(E.guser
deleted the row) then cancel that Forestry Inspection.

Author :   Israa Ismail

Functional Area : Records
 
Sample Call : cancelForestryInsp()

*/

cancelForestryInsp();
