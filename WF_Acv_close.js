function close_acv(){
	window.open(nlapiResolveURL('SUITELET', 'customscript_sut_attach_signed_estimate', 'customdeploy1')+ '&entity=' + nlapiGetRecordId() + '&estatus=' + estimate_status, '','');
   return true;
}