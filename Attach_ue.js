function pageInit(type,form)
{
	if(type!='edit'){
		//On init, if estimatemis approved add button to the form
   var reocrd_id = nlapiGetRecordId();   
   var estimate_status = nlapiGetFieldValue('custbody_manager_approval_status');
   if(estimate_status == 2)
	form.setScript('customscript269');
	form.addButton('custpagetestbutton', 'TEST button', 'pageInit2('+reocrd_id+')');
	}
   
}