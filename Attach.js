function pageInit(type)
{
	if(type!='edit'){
		//On init, if estimatemis approved add button to the form
   var estimate_status = nlapiGetFieldValue('custbody_manager_approval_status');
   if(estimate_status == 2)
	form.addButton('custpagetestbutton', 'TEST button', '');
	}
   
}