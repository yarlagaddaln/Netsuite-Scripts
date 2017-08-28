function so_set_commision() {

	var so_id = nlapiGetFieldValue('custrecord_macv_sales_order_num');
	var comission_eligible_amount = nlapiGetFieldValue('custrecord_commission_amount');
	var comission_eligible_status = nlapiGetFieldValue('custrecord_eligible_for_commission');
	var comission_not_eligible_status = nlapiGetFieldValue('custrecord_not_eligible_commission');
	//load sales order
	var sales_record = nlapiLoadRecord('salesorder', so_id);

	//get the opp number from estimate
	var estimate_no = nlapiGetFieldValue('custrecord_macv_estimate');

	//setting the sales team with the reps on the comisison moduel.
	var team_count = sales_record.getLineItemCount('salesteam');

	//var emp_status = new array();
	// loop throught the team

	for (var i = 1; i <= team_count; i++) {
		/* if(nlapiLookupField('employee', sales_record.getLineItemValue('salesteam','employee',i), 'isinactive') == 'T'){
		emp_status.push(sales_record.getLineItemValue('salesteam','employee',i));
		} */

		if (i == 1) {
			if (nlapiLookupField('employee', sales_record.getLineItemValue('salesteam', 'employee', i), 'isinactive') != 'T') {
				sales_record.setFieldValue('custbody34', sales_record.getLineItemValue('salesteam', 'employee', i));
			} else {
				alert('Sales Rep 1 is Inactive on Sales Order');
			}

		}
		if (i == 2) {
			if (nlapiLookupField('employee', sales_record.getLineItemValue('salesteam', 'employee', i), 'isinactive') != 'T') {
				sales_record.setFieldValue('custbody35', sales_record.getLineItemValue('salesteam', 'employee', i));
			} else {
				alert('Sales Rep 2 is Inactive on Sales Order');
			}
		}
		if (i == 3) {
			if (nlapiLookupField('employee', sales_record.getLineItemValue('salesteam', 'employee', i), 'isinactive') != 'T') {
				sales_record.setFieldValue('custbody36', sales_record.getLineItemValue('salesteam', 'employee', i));
			} else {
				alert('Sales Rep 3 is Inactive on Sales Order');
			}
		}
	}

	//enter here if comission status is eligible from model acv
	if (comission_eligible_status == 'T') {
		//adding discount line item to sales record
		//check whether comission alread calculated before
		var get_commision_line_count = sales_record.getLineItemCount('item');
		//flag to check comission line defaults 1
		var comm_add_flag = 1;

		//checking through the items for any comission line item
		for (var u = 1; u <= get_commision_line_count; u++) {
			if (sales_record.getLineItemValue('item', 'item', u) == 1070) {
				//flag to check comission line setting to 0 as comission line already exists
				comm_add_flag = 0;
			}

		}

		//set the old commission ineligible value if any to null
		nlapiSetFieldValue('custrecord_commission_not_eligible_stat', '');
		nlapiSetFieldValue('custrecord_note_commission_qulaification', '');

		//setting comission status to eligible irrespective of previous status as comission is checked as eligible from model acv
		sales_record.setFieldValue('custbody40', 3);
		sales_record.setFieldValue('custbody_commission_amount', comission_eligible_amount);
		//alert(comm_add_flag+comission_eligible_amount);
		// will addd  a new comission line only if comm flag is 1 i.e no comission line item exits
		if (comm_add_flag == 1) {

			/* sales_record.selectNewLineItem('item');
			sales_record.setCurrentLineItemValue('item', 'item', 1070);
			sales_record.setCurrentLineItemValue('item', 'price', -1, true, true);
			//sales_record.setCurrentLineItemValue('item', 'rate', 0, true, true);
			sales_record.setCurrentLineItemValue('item', 'amount', 0, true, true);
			//sales_record.setCurrentLineItemValue('item', 'altsalesamt', comission_eligible_amount, true, true);
			sales_record.commitLineItem('item'); */
			//alert('here 1');
			nlapiSubmitRecord(sales_record, true, true);

			var set_comm_ammount = nlapiLoadRecord('salesorder', so_id);
			/* var lines_count_afteradd_new = set_comm_ammount.getLineItemCount('item');
			//get the line item count
			for( l = 1; l <= lines_count_afteradd_new; l++ ){
			if (set_comm_ammount.getLineItemValue('item', 'item', l) == 1070) {
			set_comm_ammount.setLineItemValue('item', 'altsalesamt', l, comission_eligible_amount);

			}
			} */
			//looking the sales order status to set Comm status based on current SO status
			var filters = new Array();
			filters[0] = new nlobjSearchFilter('internalid', null, 'is', so_id);
			//filters[1] = new nlobjSearchFilter('status', null, 'anyof', ['SalesOrd:A','SalesOrd:B','SalesOrd:C']);
			filters[1] = new nlobjSearchFilter('mainline', null, 'is', 'T');

			var columns = new Array();
			columns[0] = new nlobjSearchColumn('statusref');
			var results = nlapiSearchRecord('salesorder', null, filters, columns);

			if (results.length > 0) {
				var comm_status = results[0].getValue('statusref');
			}
			//set so status to commisson status as Pednding Billing if sales order is not fullyBilled
			if ((comm_status == 'partiallyFulfilled') || (comm_status == 'pendingBilling') || (comm_status == 'pendingFulfillment') || (comm_status == 'pendingBillingPartFulfilled')) {
				//alert(set_comm_ammount.getFieldValue('custbody_comm_paid_date'));
				if (set_comm_ammount.getFieldValue('custbody_comm_paid_date') == '') {
					set_comm_ammount.setFieldValue('memo', 'Sales Order Pending Billing');
				}

			}

			//if sales order status is fullyBilled set commisson status to billed
			if ((comm_status == 'fullyBilled')) {
				set_comm_ammount.setFieldValue('memo', 'Sales Order ' + comm_status);
			}
			set_comm_ammount.setFieldValue('custbody_so_commission_not_qualified_r', '');
			set_comm_ammount.setFieldValue('custbody_comm_not_eligible_status', '');
			nlapiSubmitRecord(set_comm_ammount, true, true);
		}

		if (comm_add_flag == 0) {
			//alert('here 2');
			// update sales order if comission line already exist with the new comission amount
			var load_after_submit = nlapiLoadRecord('salesorder', so_id);
			/* var lines_count_afteradd = load_after_submit.getLineItemCount('item');
			for (var q = 1; q <= lines_count_afteradd; q++) {
			if (load_after_submit.getLineItemValue('item', 'item', q) == 1070) {
			load_after_submit.setLineItemValue('item', 'altsalesamt', q, comission_eligible_amount);
			}
			} */
			load_after_submit.setFieldValue('custbody40', 3);
			load_after_submit.setFieldValue('custbody_commission_amount', comission_eligible_amount);

			//looking the sales order status to set Comm status based on current SO status
			var filters = new Array();
			filters[0] = new nlobjSearchFilter('internalid', null, 'is', so_id);
			//filters[1] = new nlobjSearchFilter('status', null, 'anyof', ['SalesOrd:A','SalesOrd:B','SalesOrd:C']);
			filters[1] = new nlobjSearchFilter('mainline', null, 'is', 'T');

			var columns = new Array();
			columns[0] = new nlobjSearchColumn('statusref');
			var results = nlapiSearchRecord('salesorder', null, filters, columns);

			if (results.length > 0) {
				var comm_status = results[0].getValue('statusref');
			}
			//alert(comm_status);
			//set so status to commisson status as Pednding Billing if sales order is not fullyBilled
			if ((comm_status == 'partiallyFulfilled') || (comm_status == 'pendingBilling') || (comm_status == 'pendingFulfillment') || (comm_status == 'pendingBillingPartFulfilled')) {

				if (load_after_submit.getFieldValue('custbody_comm_paid_date') == '') {
					load_after_submit.setFieldValue('memo', 'Sales Order Pending Billing');
				}

			}

			//if sales order status is fullyBilled set commisson status to billed
			if ((comm_status == 'fullyBilled')) {
				load_after_submit.setFieldValue('memo', 'Sales Order ' + comm_status);
			}
			load_after_submit.setFieldValue('custbody_so_commission_not_qualified_r', '');
			load_after_submit.setFieldValue('custbody_comm_not_eligible_status', '');

			nlapiSubmitRecord(load_after_submit, true, true);

		}
		if (estimate_no) {
			var opp_no = nlapiLookupField('estimate', estimate_no, 'custbody_linked_opportunity');
			//update the linked opp based on the linked estimate

			if (opp_no) { //if opp exists
				nlapiSubmitField('opportunity', opp_no, 'custbody_commission_eligibility_opp', 3);
				nlapiSubmitField('opportunity', opp_no, 'custbody_comm_not_qualified_reason_opp', '');
				nlapiSubmitField('opportunity', opp_no, 'custbody_comm_not_eligible_stat_opp', nlapiGetFieldValue('custrecord_commission_not_eligible_stat'));

			}

		}

	}

	//enter here if comission status is in eligible from the model acv
	if (comission_not_eligible_status == 'T') {
		var load_after_not_eligible_status = nlapiLoadRecord('salesorder', so_id);
		//reset comission status
		//alert(load_after_not_eligible_status.getFieldValue('custbody40'));
		if ((load_after_not_eligible_status.getFieldValue('custbody40') == 1) || (load_after_not_eligible_status.getFieldValue('custbody40') == null) || (load_after_not_eligible_status.getFieldValue('custbody40') == 3) || (load_after_not_eligible_status.getFieldValue('custbody40') == 2)) {

			load_after_not_eligible_status.setFieldValue('custbody40', 2);
			load_after_not_eligible_status.setFieldValue('custbody_commission_amount', 0);
			//load_after_not_eligible_status.setFieldValue('memo', nlapiLookupField ('salesorder', so_id , 'custbody40' ,true));

			// looking for the sales comission value in line item

			/* var get_itemcount_ineligible = load_after_not_eligible_status.getLineItemCount('item');
			for (var j = 1; j <= get_itemcount_ineligible; j++) {
			if (load_after_not_eligible_status.getLineItemValue('item', 'item', j) == 1070) {
			load_after_not_eligible_status.setLineItemValue('item', 'altsalesamt', j, 0);
			}
			} */
			nlapiSubmitRecord(load_after_not_eligible_status, true, true);

			var load_after_submit = nlapiLoadRecord('salesorder', so_id);
			load_after_submit.setFieldValue('memo', nlapiLookupField('salesorder', so_id, 'custbody40', true));
			load_after_submit.setFieldValue('custbody_so_commission_not_qualified_r', nlapiGetFieldValue('custrecord_note_commission_qulaification'));
			load_after_submit.setFieldValue('custbody_comm_not_eligible_status', nlapiGetFieldValue('custrecord_commission_not_eligible_stat'));
			nlapiSubmitRecord(load_after_submit, true, true);

			//update the linked opp based on the linked estimate
			//var estimate_no = nlapiGetFieldValue('createdfrom');
			//get the opp number from estimate
			if (estimate_no) {
				var opp_no = nlapiLookupField('estimate', estimate_no, 'custbody_linked_opportunity');
				if (opp_no) { //if opp exists
					nlapiSubmitField('opportunity', opp_no, 'custbody_commission_eligibility_opp', 2);
					nlapiSubmitField('opportunity', opp_no, 'custbody_comm_not_qualified_reason_opp', nlapiGetFieldValue('custrecord_note_commission_qulaification'));
					nlapiSubmitField('opportunity', opp_no, 'custbody_comm_not_eligible_stat_opp', nlapiGetFieldValue('custrecord_commission_not_eligible_stat'));

				}
			}

		}

	}

	if ((comission_not_eligible_status != 'T') && (comission_eligible_status != 'T')) {

		nlapiSubmitField('salesorder', so_id, 'custbody40', 1);
		nlapiSubmitField('salesorder', so_id, 'memo', nlapiLookupField('salesorder', so_id, 'custbody40', true));
	}

	return true;
}