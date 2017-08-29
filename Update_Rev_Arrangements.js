/*
Updates the Revenue Elements on the Revenue Arrangement based on Sales order fulfilment dates
 */
function update_revenue_elements_arrangements(type) {

	//get the current sales order id from the fulfilment record

	var salesorder_id = nlapiGetFieldValue('createdfrom');

	//search to get linked revenue arragement for the salesorder
	var revenueelementSearch = nlapiSearchRecord("revenueelement", null,
			[
				["sourcetransaction.type", "anyof", "SalesOrd"],
				"AND",
				["sourcetransaction.internalid", "anyof", salesorder_id]
			],
			[
				new nlobjSearchColumn("revenuearrangement", null, "GROUP")
			]);

	if ((revenueelementSearch)&&(revenueelementSearch.length >= 1)) {
		//loop through the revenue elements and reset the dates as per the fulfilment date
		for (var i in revenueelementSearch) {
			//nlapiLogExecution('debug', 'Revenue Element', revenueelementSearch[i].getId());
			//nlapiLogExecution('debug', 'customer', revenueelementSearch[i].getValue('recordnumber'));
			nlapiLogExecution('debug', 'Revenue Arrangement', revenueelementSearch[0].getValue('revenuearrangement', null, 'group'));
			nlapiLogExecution('debug', 'Fulfilment Date', nlapiGetFieldValue('trandate'));

			//update the revenue arragement only once

			//nlapiSubmitField('revenuearrangement',revenueelementSearch[i].getValue('revenuearrangement').match(/\d+$/)[0],'trandate',nlapiGetFieldValue('trandate'));
			nlapiLogExecution('debug', 'Revenue Arrangement Updates only once ', revenueelementSearch[0].getValue('revenuearrangement', null, 'group'));

			//load the revenue arragement record and update the fields
			var revenue_arrangement_load = nlapiLoadRecord('revenuearrangement', revenueelementSearch[0].getValue('revenuearrangement', null, 'group').match(/\d+$/)[0]);

			revenue_arrangement_load.setFieldValue('trandate', nlapiGetFieldValue('trandate'));
			//get the revenue elements count on the revenue arragement
			var revenue_element_count = revenue_arrangement_load.getLineItemCount('revenueelement');

			for (j = 1; j <= revenue_element_count; j++) {

				revenue_arrangement_load.setLineItemValue('revenueelement', 'revrecstartdate', j, nlapiGetFieldValue('trandate'));
				revenue_arrangement_load.setLineItemValue('revenueelement', 'forecaststartdate', j, nlapiGetFieldValue('trandate'));
				//revenue_arrangement_load.commitLineItem('revenueelement');
				
				//update revenue plan based on revenue element
				
				var revenueplanSearch = nlapiSearchRecord("revenueplan",null,
				[
				   ["revenueplantype","anyof","ACTUAL","FORECAST"], 
				   "AND", 
				   ["revenueelement.internalid","anyof",revenue_arrangement_load.getLineItemValue('revenueelement','revenueelement',j)]
				], 
				[
				   new nlobjSearchColumn("recordnumber",null,null).setSort(false)
				]
				);
				
				//submit the revenue plans
				if ((revenueplanSearch)&&(revenueplanSearch.length >= 1)) {
					//loop through the revenue elements and reset the dates as per the fulfilment date
				for (var k in revenueplanSearch) {
					
					//update the revenue plan start date with fulfilment start date
					nlapiSubmitField('revenueplan',revenueplanSearch[k].id,'revrecstartdate',nlapiGetFieldValue('trandate'));
				}
					
				}

			}

			//load the revenue elements for each arrangement and update the start date on the revenue element one at a time
			//nlapiSubmitField('revenueelement',revenueelementSearch[i].getId(),'revrecstartdate',nlapiGetFieldValue('trandate'));
			//nlapiSubmitField('revenueelement',revenueelementSearch[i].getId(),'forecaststartdate',nlapiGetFieldValue('trandate'));


		}
		nlapiSubmitRecord(revenue_arrangement_load, true, true);
		//update the sales order line items with fulfilment date as revenue start date
		var load_sales_order = nlapiLoadRecord('salesorder', salesorder_id);

		//get the line item count on the sales order to update the each line with the fulfilment start date as revenue start date

		var sales_line_count = load_sales_order.getLineItemCount('item');
		nlapiLogExecution('debug', 'Line Item Count', sales_line_count);

		//loop through the line items on sales order and update the dates
		for (k = 1; k <= sales_line_count; k++) {
			load_sales_order.setLineItemValue('item', 'custcol_revenue_start_date', k, nlapiGetFieldValue('trandate'));
			load_sales_order.commitLineItem('item');
		}
		var salesorder_id = nlapiSubmitRecord(load_sales_order, true, true);
		nlapiLogExecution('debug', 'Updated Sales Order is :', salesorder_id);
	}
	else{
		//update the sales order line items with fulfilment date as revenue start date
		var load_sales_order = nlapiLoadRecord('salesorder', salesorder_id);

		//get the line item count on the sales order to update the each line with the fulfilment start date as revenue start date

		var sales_line_count = load_sales_order.getLineItemCount('item');
		nlapiLogExecution('debug', 'Line Item Count', sales_line_count);

		//loop through the line items on sales order and update the dates
		for (k = 1; k <= sales_line_count; k++) {
			load_sales_order.setLineItemValue('item', 'custcol_revenue_start_date', k, nlapiGetFieldValue('trandate'));
			load_sales_order.commitLineItem('item');
		}
		var salesorder_id = nlapiSubmitRecord(load_sales_order, true, true);
		nlapiLogExecution('debug', 'Updated Sales Order is :', salesorder_id);
		
	}
}