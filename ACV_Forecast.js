/**
 * ACV Calculation functions for the ACV Module.
 * Author : Lakshmi
 * Copyright (c) 2017 Axioma Inc.
 * @Version Suitescript 1.0
 */

/* To Prepopulate Sales order data into ACV custom record on Save or After Submit for newly created SO.
Doesn't Consider Legacy
 */

function beforeLoadScript(type, form, request) {
  if(type=='view'){
      var record_id = nlapiGetRecordId();
	  var acv_id_status =  nlapiGetFieldValue('custbody_so_macv_id');
	   var url = '';
	   //generate url based on environment
	   var url = 'https://system.sandbox.netsuite.com';
		if(nlapiGetContext().getEnvironment()=='PRODUCTION'){
			url = 'https://system.netsuite.com';
		}
		var script='';
	 //add buttons based on ACV model status
	 if(acv_id_status){
		 //url = nlapiResolveURL('customrecord183', 'Acvforecast', 'customdeploy1');
		 	 script = "window.open('"+url+nlapiResolveURL('RECORD', 'customrecord_model_acv', acv_id_status)+"&e=T&so_id="+record_id+"', '_blank','toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=1000,height=1000')";
		   	/*var script = "window.open('https://system.sandbox.netsuite.com/app/common/custom/custrecordentry.nl?rectype=184&id="+acv_id_status+"&e=T&so_id="+record_id+"', '_blank','toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=1000,height=1000');";*/
		form.addButton('custpage_recalc', 'Edit Model ACV', script );
	 }
	 else{
		 script = "window.open('"+url+nlapiResolveURL('RECORD', 'customrecord_model_acv', acv_id_status)+"&so_id="+record_id+"', '_blank','toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=1000,height=1000')";
		   	/*script = "window.open('https://system.sandbox.netsuite.com/app/common/custom/custrecordentry.nl?rectype=184&so_id="+record_id+"', '_blank','toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=1000,height=1000');";*/
	form.addButton('custpage_recalc', 'Model ACV', script );
	 }

    
  }

}
