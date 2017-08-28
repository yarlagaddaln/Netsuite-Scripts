function beforeLoadScript(type, form, request) {
	form.setScript('customscript_client_function');
	form.addButton('custpage_recalc', 'Model ACV', 'ACV_Layer_Record()' );
}