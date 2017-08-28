function runScheduledScript() {
	var search = nlapiLoadSearch('invoice', 'customsearch2129');
	var searchResults = search.runSearch();

	// resultIndex points to record starting current resultSet in the entire results array
	var resultIndex = 0;
	var resultStep = 1000; // Number of records returned in one step (maximum is 1000)
	var resultSet; // temporary variable used to store the result set
	do {
		// fetch one result set
		resultSet = searchResults.getResults(resultIndex, resultIndex + resultStep);

		// increase pointer
		resultIndex = resultIndex + resultStep;

		// process or log the results
		if (resultSet) {

			for (var i = 0; i < resultSet.length; i++) {
				var searchEst = resultSet[i].getAllColumns();
				var so_id = resultSet[i].getValue(searchEst[0]);
				var so_status = resultSet[i].getValue(searchEst[2]);
				var invoice_status = resultSet[i].getValue(searchEst[5]);
				var so_status_memo = resultSet[i].getValue(searchEst[7]);
				
				//updating sales order based on so status & Invoice Status
				if (invoice_status) {
					//nlapiLogExecution('DEBUG', "so id", 'value' + so_id);
					//nlapiLogExecution('DEBUG', "so id", 'value' + so_status);
					//nlapiLogExecution('DEBUG', "so id", 'value' + invoice_status);
					//load sales order to update commisson status
					var comm_status = '';
					if (invoice_status == 'Paid In Full') {
						comm_status = 'Payment Received - Commission To Be Paid' ;
					} else {
						comm_status = 'Sales Order Billed' ;
					}
					 var res_so_memo = so_status_memo.split("-");
					if(res_so_memo[0].trim()!= 'Commission Paid to SalesRep'){
						 //nlapiLogExecution('DEBUG', "comm original status", 'value' + res_so_memo[0]);
						nlapiSubmitField('salesorder', so_id, 'memo', comm_status);
					} 
					//nlapiSubmitField('salesorder', so_id, 'memo', comm_status);
				}

				var context = nlapiGetContext();
				//checking script governance to stop the script from failing
				if (context.getRemainingUsage() <= 100) {
					var stateMain = nlapiYieldScript();
					if (stateMain.status == 'FAILURE') {
						nlapiLogExecution("debug", "Failed to yield script (do-while), exiting: Reason = " + stateMain.reason + " / Size = " + stateMain.size);
						throw "Failed to yield script";
					} else if (stateMain.status == 'RESUME') {
						nlapiLogExecution("debug", "Resuming script (do-while) because of " + stateMain.reason + ". Size = " + stateMain.size);
					}
				}

			}

		}

	} while (resultSet.length > 0);

}