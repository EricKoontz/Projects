function getWorkflowTaskName() {
	// find record type
	var cap = aa.cap.getCap(capId).getOutput();
	var capType = cap.getCapType().toString();
	
	if (capType=="")return "";
	var wfTaskToUpdate="";
	
	if (capType.equals("Planning/Application/Conditional Use/NA")) {
		if (wfProcess == "PLN_COND_USE") {
			 if (wfTask=="Pre Submittal Meetings" && wfStatus=="Route for Review") wfTaskToUpdate="Planning Pre Acceptance"; 
			 else if (wfTask=="Application Acceptance" && wfStatus=="Accepted") wfTaskToUpdate="Review Distribution";
			 else if (wfTask=="Review Distribution" && wfStatus=="In Review")wfTaskToUpdate="Planning Review";
			 else if (wfTask=="Review Consolidation" && wfStatus=="Review Complete")   wfTaskToUpdate="Hearing Scheduled" ;
			 else if (wfTask=="Review Consolidation" && wfStatus=="Resubmittal Requested") wfTaskToUpdate="Submission Quality Check";
			 else if (wfTask=="PC Legal Notification" && wfStatus=="Notification Sent") wfTaskToUpdate="Staff Report,Prepare Signs and Notice - PC"
			 else if (wfTask=="Generate Hearing Results" && wfStatus=="Complete") wfTaskToUpdate="Add to Council Agenda";
			 else if (wfTask=="Council Legal Notification" && wfStatus=="Notification Sent") wfTaskToUpdate="Complete E-Agenda,Prepare Signs and Notice - CC";
			 else if (wfTask=="Planning Commission Hearing" && (wfStatus=="Recommend Denial" || wfStatus=="Recommend Approval")) wfTaskToUpdate="Generate Hearing Results";
			 else if ((wfTask=="Complete E-Agenda" || wfTask=="Prepare Signs and Notice - CC") && wfStatus=="Complete") wfTaskToUpdate="City Council Meeting";
			 else {
				 var tasksArray=["Landscape Review","Addressing Review","Planning Review","Forestry Review","Licensing Review","Code Enforcement Review","Urban Renewal Review","Neighborhood Services Review","Traffic Review","Life Safety Review","ODA Review"];
				 var statusesArray=["Complete","Proceed-Tech","Resubmittal Requested","Comments Not Received"];
				 var isMatch=checkTrigger(tasksArray,statusesArray);				 
				 if (isMatch) wfTaskToUpdate="Review Consolidation";
			 }      
		}
	} else if (capType.equals("Planning/Application/Master Plan/NA")) {
		if (wfProcess == "PLN_MST_PLN") {
			if (wfTask=="Pre Submittal Meetings" && wfStatus=="Route for Review") wfTaskToUpdate="Planning Pre Acceptance";
			else if (wfTask=="Review Distribution" &&  wfStatus=="In Review") wfTaskToUpdate="Planning Review";
			else if (wfTask=="Application Acceptance" && wfStatus=="Accepted") wfTaskToUpdate="Review Distribution";
			else if (wfTask=="Review Consolidation" && wfStatus=="Resubmittal Requested") wfTaskToUpdate="Submission Quality Check";
			else if (wfTask=="Review Consolidation" && wfStatus=="Review Complete") wfTaskToUpdate="Administrative Decision";
			else if (wfTask=="Appeal" && wfStatus=="Appeal Filed") wfTaskToUpdate="Create E-Agenda,Prepare Signs and Notices – AD";
			else if (wfTask=="PC Legal Notification" && wfStatus=="Notification Sent") wfTaskToUpdate= "Staff Report,Prepare Signs and Notice - PC";
			else if (wfTask=="Generate Hearing Results" && wfStatus=="Complete") wfTaskToUpdate="Add to Council Agenda";
			else if (wfTask=="Council Legal Notification" && wfStatus=="Notification Sent") wfTaskToUpdate="Complete E-Agenda,Prepare Signs and Notice - CC"
			else if ((wfTask=="Complete E-Agenda" || wfTask=="Prepare Signs and Notice - CC") &&  wfStatus=="Complete")wfTaskToUpdate="City Council Meeting";
			else if (wfTask=="Planning Commission Hearing" && (wfStatus=="Recommend Denial" || wfStatus=="Recommend Approval")) wfTaskToUpdate="Generate Hearing Results";
			else if (( wfTask=="Create E-Agenda" || wfTask=="Prepare Signs and Notices - AD") && wfStatus=="Complete")wfTaskToUpdate="Hearing Scheduling";
			else {
				 var tasksArray=["Landscape Review", "Addressing Review", "Planning Review", "Forestry Review", "Licensing Review", "Code Enforcement Review", "Urban Renewal Review", "Neighborhood Services Review", "Traffic Review", "Life Safety Review", "ODA Review"];
				 var statusesArray=["Complete", "Proceed-Tech", "Resubmittal Requested", "Comments Not Received"];
				 var isMatch=checkTrigger(tasksArray,statusesArray);				 
				 if (isMatch) wfTaskToUpdate="Review Consolidation";
			}			
		}// process
	} else if (capType.equals("Planning/Application/Master Plan/Amendment")) {
		if (wfProcess == "PLN_MST_PLN_AMND") {
			if (wfTask=="Pre Submittal Meetings" && wfStatus=="Route for Review") wfTaskToUpdate="Planning Pre Acceptance,Planning GIS Pre Acceptance";
			else if (wfTask=="Application Acceptance" && wfStatus=="Accepted") wfTaskToUpdate="Review Distribution";
			else if (wfTask=="Review Distribution" && wfStatus=="In Review")wfTaskToUpdate="Planning Review";
			else if (wfTask=="Review Consolidation" && wfStatus=="Resubmittal Requested") wfTaskToUpdate="Submission Quality Check";
			else if (wfTask=="Review Consolidation" && wfStatus=="Review Complete") wfTaskToUpdate="Administrative Decision";
			else if (wfTask=="Appeal" && wfStatus=="Appeal Filed") wfTaskToUpdate="Create E-Agenda,Prepare Signs and Notices - AD";
			else if (wfTask=="PC Legal Notification" && wfStatus=="Notification Sent") wfTaskToUpdate="Staff Report,Prepare Signs and Notice - PC";
			else if (wfTask=="Generate Hearing Results" && wfStatus=="Complete") wfTaskToUpdate="Add to Council Agenda";
			else if (wfTask=="Council Legal Notification" && wfStatus=="Notification Sent") wfTaskToUpdate="Complete E-Agenda,Prepare Signs and Notice - CC"
			else if (wfTask=="City Council Meeting" && (wfStatus=="Denied" || wfStatus=="Approved")) wfTaskToUpdate="Appeal Period";
			else if ((wfTask=="Complete E-Agenda" || wfTask=="Prepare Signs and Notice - CC") && wfStatus=="Complete")wfTaskToUpdate="City Council Meeting";
			else if (wfTask=="Planning Commission Hearing" && (wfStatus=="Recommend Denial" || wfStatus=="Recommend Approval")) wfTaskToUpdate="Generate Hearing Results";
			else if ((wfTask=="Create E-Agenda" || wfTask=="Prepare Signs and Notices - AD") && wfStatus=="Complete" )wfTaskToUpdate="Hearing Scheduling";
			else {
				 var tasksArray=["Landscape Review", "Addressing Review", "Planning Review", "Forestry Review", "Licensing Review", "Code Enforcement Review", "Urban Renewal Review", "Neighborhood Services Review", "Traffic Review", "Life Safety Review", "ODA Review"];
				 var statusesArray=["Complete", "Proceed-Tech", "Resubmittal Requested", "Comments Not Received"];
				 var isMatch=checkTrigger(tasksArray,statusesArray);				 
				 if (isMatch) wfTaskToUpdate="Review Consolidation";
				}
			}	
	} else if (capType.equals("Planning/Application/Preliminary Plat/NA")) {
		if (wfProcess == "PLN_PRE_PLAT") {
			if (wfTask=="Pre Submittal Meetings" && wfStatus=="Route for Review")wfTaskToUpdate="Planning Pre Acceptance";
			else if (wfTask=="Application Acceptance" && wfStatus=="Accepted")wfTaskToUpdate="Review Distribution";
			else if (wfTask=="Review Distribution" && wfStatus=="In Review") wfTaskToUpdate="Planning Review";
			else if (wfTask=="Review Consolidation" && wfStatus=="Resubmittal Requested") wfTaskToUpdate="Submission Quality Check";
			else if (wfTask=="Review Consolidation" && wfStatus=="Review Complete")wfTaskToUpdate="Administrative Decision";
			else if (wfTask=="Appeal" && wfStatus=="Appeal Filed")wfTaskToUpdate="Create E-Agenda,Prepare Signs and Notices - AD"
			else if (wfTask=="PC Legal Notification" && wfStatus=="Notification Sent") wfTaskToUpdate="Staff Report,Prepare Signs and Notice - PC"
			else if (wfTask =="Planning Commission Hearing" && (wfStatus=="Recommend Denial" || wfStatus=="Recommend Approval"))wfTaskToUpdate="Generate Hearing Results";
			else if (wfTask=="Generate Hearing Results" && wfStatus=="Complete") wfTaskToUpdate="Add to Council Agenda"; 
			else if (wfTask=="Council Legal Notification" && wfStatus=="Notification Sent") wfTaskToUpdate="Complete E-Agenda,Prepare Signs and Notice - CC";
			else if (wfTask=="City Council Meeting" && (wfStatus=="Denied" || wfStatus=="Approved"))wfTaskToUpdate="Appeal Period – CC";
			else if ((wfTask =="Complete E-Agenda" ||  wfTask=="Prepare Signs and Notice - CC") && wfStatus=="Complete") wfTaskToUpdate="City Council Meeting";
			else if ((wfTask =="Create E-Agenda" || wfTask=="Prepare Signs and Notices - AD") && wfStatus=="Complete") wfTaskToUpdate="Hearing Scheduling";
			else {
				 var tasksArray=["Landscape Review", "Addressing Review", "Planning Review", "Forestry Review", "Licensing Review", "Code Enforcement Review", "Urban Renewal Review", "Neighborhood Services Review", "Traffic Review", "Life Safety Review", "ODA Review"];
				 var statusesArray=["Complete", "Proceed-Tech", "Resubmittal Requested", "Comments Not Received"];
				 var isMatch=checkTrigger(tasksArray,statusesArray);				 
				 if (isMatch) wfTaskToUpdate="Review Consolidation";
			}
		}
	} else if (capType.equals("Planning/Application/Rezoning/NA")) {
		if (wfProcess == "PLN_REZONE") {
			 if (wfTask=="Pre Submittal Meetings" && wfStatus=="Route for Review")wfTaskToUpdate="Planning Pre Acceptance";
			 else if (wfTask=="Application Acceptance" && wfStatus=="Accepted")wfTaskToUpdate="Review Distribution";
			 else if (wfTask=="Review Distribution" && wfStatus=="In Review") wfTaskToUpdate="Planning Review";
			 else if (wfTask=="Review Consolidation" && wfStatus=="Resubmittal Requested") wfTaskToUpdate="Submission Quality Check";
			 else if (wfTask=="Review Consolidation" && wfStatus=="Review Complete") wfTaskToUpdate="Hearing Scheduling";
			 else if (wfTask=="PC Legal Notification" && wfStatus=="Notification Sent") wfTaskToUpdate="Staff Report,Prepare Signs and Notice - PC"
			 else if (wfTask=="Generate Hearing Results" && wfStatus=="Complete") wfTaskToUpdate="Add to Council Agenda"; 
			 else if (wfTask=="Council Legal Notification" && wfStatus=="Notification Sent") wfTaskToUpdate="Complete E-Agenda,Prepare Signs and Notice - CC";
			 else if (wfTask=="City Council Meeting" && (wfStatus=="Denied" || wfStatus=="Approved"))wfTaskToUpdate="Appeal Period"
			 else if ((wfTask =="Complete E-Agenda" ||  wfTask=="Prepare Signs and Notice - CC") && wfStatus=="Complete") wfTaskToUpdate="City Council Meeting";
			 else if (wfTask =="Planning Commission Hearing" && (wfStatus=="Recommend Denial" || wfStatus=="Recommend Approval"))wfTaskToUpdate="Generate Hearing Results";
			 else {
				 var tasksArray=["Planning Review", "Neighborhood Liason Review", "Water Department Review", "ODA Review"];
				 var statusesArray=["Complete", "Proceed-Tech", "Resubmittal Requested", "Comments Not Received"];
				 var isMatch=checkTrigger(tasksArray,statusesArray);				 
				 if (isMatch) wfTaskToUpdate="Review Consolidation";
				 }
			}
	} else if (capType.equals("Planning/Application/Site Plan/Amendment")) {
		if (wfProcess == "PLN_SITE_PLAN") {
			 if (wfTask=="Pre Submittal Meetings" && wfStatus=="Route for Review")wfTaskToUpdate="Planning Pre Acceptance";
			 else if (wfTask=="Application Acceptance" && wfStatus=="Accepted")wfTaskToUpdate="Review Distribution";
			 else if (wfTask=="Review Distribution" && wfStatus=="In Review") wfTaskToUpdate="Planning Review";
			 else if (wfTask=="Review Consolidation" && wfStatus=="Resubmittal Requested") wfTaskToUpdate="Submission Quality Check";
			 else if (wfTask=="Review Consolidation" && wfStatus=="Review Complete") wfTaskToUpdate="Hearing Scheduling";
			 else if (wfTask=="PC Legal Notification" && wfStatus=="Notification Sent") wfTaskToUpdate="Staff Report,Prepare Signs and Notice - PC"
			 else if (wfTask=="Generate Hearing Results" && wfStatus=="Complete") wfTaskToUpdate="Add to Council Agenda";
			 else if (wfTask=="Council Legal Notification" && wfStatus=="Notification Sent") wfTaskToUpdate="Complete E-Agenda,Prepare Signs and Notice - CC";	 
			 else if ((wfTask =="Complete E-Agenda" ||  wfTask=="Prepare Signs and Notice - CC") && wfStatus=="Complete") wfTaskToUpdate="City Council Meeting";
			 else if (wfTask =="Planning Commission Hearing" && (wfStatus=="Recommend Denial" || wfStatus=="Recommend Approval"))wfTaskToUpdate="Generate Hearing Results";
			 else {
				 var tasksArray=["Planning Review", "Neighborhood Liason Review", "Water Department Review", "ODA Review"];
				 var statusesArray=["Complete", "Proceed-Tech", "Resubmittal Requested", "Comments Not Received"];
				 var isMatch=checkTrigger(tasksArray,statusesArray);				 
				 if (isMatch) wfTaskToUpdate="Review Consolidation";
				 }
			 }
} else if (capType.equals("Planning/Application/Site Plan/Major")) {
		if (wfProcess == "PLN_SITE_MAJOR") {
			if (wfTask=="Pre Submittal Meetings" && wfStatus=="Route for Review") wfTaskToUpdate="Planning Pre Acceptance";
			else if (wfTask=="Application Acceptance" && wfStatus=="Accepted")wfTaskToUpdate="Review Distribution";
			else if (wfTask=="Review Distribution" && wfStatus=="In Review") wfTaskToUpdate="Planning Review";
			else if (wfTask=="Review Consolidation" && wfStatus=="Resubmittal Requested") wfTaskToUpdate="Submission Quality Check";
			else if (wfTask=="Review Consolidation" && wfStatus=="Review Complete") wfTaskToUpdate="Hearing Scheduling";
			else if (wfTask=="PC Legal Notification" && wfStatus=="Notification Sent") wfTaskToUpdate="Staff Report,Prepare Signs and Notice - PC";
			else if (wfTask=="Generate Hearing Results" && wfStatus=="Complete") wfTaskToUpdate="Add to Council Agenda";
			else if (wfTask=="Council Legal Notification" && wfStatus=="Notification Sent") wfTaskToUpdate="Complete E-Agenda,Prepare Signs and Notice - CC";
			else if (wfTask=="Appeal/Call Up Period" && (wfStatus=="Complete" || wfStatus=="Appeal Not Requested"))wfTaskToUpdate="Complete Case";
			else if ((wfTask=="Complete E-Agenda" || wfTask=="Prepare Signs and Notice - CC") && wfStatus=="Complete")wfTaskToUpdate="City Council Meeting";
			else if (wfTask=="Planning Commission Hearing" && (wfStatus=="Recommend Denial" || wfStatus=="Recommend Approval"))	wfTaskToUpdate="Generate Hearing Results";
			else {
				 var tasksArray=["Planning Review", "Neighborhood Liason Review", "Water Department Review", "ODA Review"];
				 var statusesArray=["Complete", "Proceed-Tech", "Resubmittal Requested", "Comments Not Received"];
				 var isMatch=checkTrigger(tasksArray,statusesArray);				 
				 if (isMatch) wfTaskToUpdate="Review Consolidation";		
				}	
			}

	} else if (capType.equals("Planning/Application/Site Plan/Minor")) {
		if (wfProcess == "PLN_SITE_PLAN_MIN2") {
			if (wfTask=="Pre Submittal Meetings" && wfStatus=="Route for Review")wfTaskToUpdate="Planning Pre Acceptance";
			else if (wfTask=="Application Acceptance" && wfStatus=="Accepted")wfTaskToUpdate="Review Distribution";
			else if (wfTask=="Review Distribution" && wfStatus=="In Review")wfTaskToUpdate="Planning Review";
			else if (wfTask=="Review Consolidation" && wfStatus=="Resubmittal Requested")wfTaskToUpdate="Submission Quality Check";
			else if (wfTask=="Review Consolidation" && wfStatus=="Review Complete")wfTaskToUpdate="Hearing Scheduling";
			else if (wfTask=="PC Legal Notification" && wfStatus=="Notification Sent")wfTaskToUpdate="Staff Report,Prepare Signs and Notice - PC";
			else if (wfTask=="Planning Commission Hearing" && (wfStatus=="Recommend Denial" || wfStatus=="Recommend Approval"))wfTaskToUpdate="Generate Hearing Results";
			else {
				 var tasksArray=["Planning Review", "Neighborhood Liason Review", "Water Department Review", "ODA Review"];
				 var statusesArray=["Complete", "Proceed-Tech", "Resubmittal Requested", "Comments Not Received"];
				 var isMatch=checkTrigger(tasksArray,statusesArray);				 
				 if (isMatch) wfTaskToUpdate="Review Consolidation";
				
				}
			}
	}  else if (capType.equals("Planning/Special Request/Zoning Inquiry/NA")) {
		if (wfProcess == "PLN_EXPRESS") {
			if (wfTask=="Assign Zoning Inquiry" && wfStatus=="Assigned") wfTaskToUpdate="Zoning Inquiry Meeting";
			else if (wfTask=="Zoning Inquiry Meeting" && wfStatus=="Complete") wfTaskToUpdate="Review Zoning Inquiry Letter";
			else if (wfTask=="Review Zoning Inquiry Letter" && wfStatus=="Letter Approved")wfTaskToUpdate="Generate Letter";	
		}
	}

	

	return wfTaskToUpdate;
}
