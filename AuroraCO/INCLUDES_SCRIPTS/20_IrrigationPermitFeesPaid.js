//written by swakil
//edited by jmain 07/24/2018 - updated email template and param variables

if ("Payment Pending".equals(capStatus) && balanceDue == 0)
{
	var contacts = "Applicant";
	var template = "WAT_IP_PERMIT FEES PAID";
	
	//get contact
	//var aContact = getContactByType(contact, capId);
	//if (aContact) fullName = aContact.getFullName() || aContact.getFirstName() + " " + aContact.getLastName();	

 	//build ACA URL
	//var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
	//acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));  
	//var recURL = acaSite + getACAUrl();

	var eParams = aa.util.newHashtable();
	emailContacts(contacts, template, eParams, "", "", "N", "");	

	if (isTaskActive("Fee Processing"))
	{
		updateTaskAndHandleDisposition("Fee Processing", "Fees Paid");
		updateAppStatus("Pending Inspection");
		
	}	
}


 function updateTaskAndHandleDisposition(taskName, taskStatus)
{//Optional capId to use
    try
    {
        var itemCap = null;

        if(arguments.length > 2)
        {
            itemCap = arguments[2]
        }
        else
        {
            itemCap = capId;
        }
        var functionName = "updateTaskAndHandleDisposition";
        var taskResult = aa.workflow.getTask(itemCap, taskName);

        if(!taskResult.getSuccess())
        {
            logDebug("Problem while getting task " + taskResult.getErrorMessage());
        }
        task = taskResult.getOutput();
        task.setDisposition(taskStatus);  
        var updateResult = aa.workflow.handleDisposition(task.getTaskItem(),itemCap); 
        if(!updateResult.getSuccess())
        {
            logDebug("Problem while updating workflow " + updateResult.getErrorMessage());
        }

    }
    catch(e)
    {
        aa.debug("**EXCEPTION in function " + functionName, e);
        throw(e);
    }

}