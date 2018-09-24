// Begin script to set the file date to today when an application is actually submitted.
if ((publicUser && vEventName == "ConvertToRealCAPAfter") || (!publicUser && vEventName == "ApplicationSubmitAfter")) {
	var vToday = new Date();
	editFileDate(vToday);
}
// End script to set the file date to today when an application is actually submitted.