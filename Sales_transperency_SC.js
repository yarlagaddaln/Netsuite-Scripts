function updateSalesOrders() {
	var context = nlapiGetContext();

	var searchresults = nlapiSearchRecord("transaction", null,
			[
				[["type", "anyof", "Estimate"], "AND", ["mainline", "is", "T"], "AND", ["salesrep", "anyof", "8152"], "AND", ["custbody_estimate_sales_report_status", "noneof", "@NONE@"], "AND", ["status", "noneof", "Estimate:V", "Estimate:X"]],
				"AND",
				["custbody_estimate_sales_report_status", "anyof", "1", "2", "5", "3", "6", "7", "8", "10", "13", "12"],
				"AND",
				["systemnotes.field", "anyof", "CUSTBODY_ESTIMATE_SALES_REPORT_STATUS"],
				"AND",
				["systemnotes.newvalue", "is", "Sales Order Fulfilled"]
			],
			[
				new nlobjSearchColumn("trandate", null, null),
				new nlobjSearchColumn("entity", null, null),
				new nlobjSearchColumn("memo", null, null),
				new nlobjSearchColumn("custbody_estimate_sales_report_status", null, null).setSort(true),
				new nlobjSearchColumn("startdate", null, null),
				new nlobjSearchColumn("enddate", null, null),
				new nlobjSearchColumn("tranid", null, null),
				new nlobjSearchColumn("custbody32", null, null),
				new nlobjSearchColumn("date", "systemNotes", null),
				new nlobjSearchColumn("newvalue", "systemNotes", null)
			]);

	if (searchresults == null)
		return;
	for (var i = 0; i < searchresults.length; i++) {
		//nlapiSubmitField('salesorder', searchresults[i].getId(), 'custbody_approved', 'T');
		nlapiLogExecution('DEBUG', 'So Id', 'Value:'+searchresults[i].getId());
		if (context.getRemainingUsage() <= 0 && (i + 1) < searchresults.length) {
			var status = nlapiScheduleScript(context.getScriptId(), context.getDeploymentId())
				if (status == 'QUEUED')
					break;
		}
	}
}