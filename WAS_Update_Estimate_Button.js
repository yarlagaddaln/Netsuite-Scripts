function Update_Client_Opt_In() {

	var recipient = 'sales-operations@axioma.com';
	var filter = new Array();
	filter[0] = new nlobjSearchFilter('custrecord_acv_estimate_num', null, 'anyof', nlapiGetRecordId());
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_acv_sales_order_num');
	columns[1] = new nlobjSearchColumn('custrecord_acv_estimate_num');
	columns[2] = new nlobjSearchColumn('custrecord_macv_id');

	//columns[2] = new nlobjSearchColumn('recordid');

	var search = nlapiSearchRecord('customrecord184', null, filter, columns);
	if (search.length >= 1) {
		nlapiLogExecution('debug', 'search legth', search.length);
		for (var i in search) {

			var estimate_no = search[i].getValue('custrecord_acv_estimate_num');
			var salesorder_no = search[i].getValue('custrecord_acv_sales_order_num');
			var linked_opp = nlapiLookupField('estimate', estimate_no, 'custbody_linked_opportunity');

			//get the ACV id to update the corresponding estimate ,sales order & Opp
			nlapiLogExecution('debug', 'acv id', search[i].getId());

			//update the sales order opt in fields based on the sales order number
			if (salesorder_no) {
				nlapiLogExecution('debug', 'salesorder', search[i].getValue('custrecord_acv_sales_order_num'));
				nlapiSubmitField('salesorder',salesorder_no,'custbody_client_opted_in','T');
			}

			//update the opp fields based on estimate linked opp
			if (estimate_no) {
				//nlapiLogExecution('debug', 'estimate', search[i].getValue('custrecord_acv_estimate_num'));
			}

			if (linked_opp) {
				nlapiLogExecution('debug', 'opp exists in estimate', linked_opp);
				nlapiSubmitField('opportunity',linked_opp,'custbody41',3);
			} else {
				nlapiSendEmail(nlapiGetContext().getUser(), recipient, 'Estmiate with out linked Opportunity', 'Please add Linked Opportunity for this Estimate# ' + nlapiGetFieldValue('tranid')); // send email
			}
			//update the macv record based on the macv id with the opt in  details
			var macv_id = search[i].getValue('custrecord_macv_id');
			if (i == 0) {
				//submit the model acv field with opt in
				nlapiLogExecution('debug', 'update macv only once', linked_opp);
				nlapiSubmitField('customrecord_model_acv',macv_id,'custrecord_macv_opt_in','T');

			}
			
			//update the acv records fields
			nlapiLogExecution('debug', 'update acv', search[i].getId());
			nlapiSubmitField('customrecord184',search[i].getId(),'custrecord_acv_opt_in','T');

		}

	}

}