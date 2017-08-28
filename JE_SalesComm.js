// define Debit and Credit Accounts for Commission payable
const COMMISSION_DEBIT = 118;
const COMMISSION_CREDIT = 181;
function runScheduledScript() {
	var search = nlapiLoadSearch('salesorder', 'customsearch2151');
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
				var so_id = resultSet[i].getValue(searchEst[3]);
				var sales_rep = parseInt(resultSet[i].getValue(searchEst[1]).trim());
				var comm_ammount = resultSet[i].getValue(searchEst[9]);
				comm_ammount = Number(comm_ammount.replace(/[^0-9\.]+/g,""));
				var invoice_no = resultSet[i].getValue(searchEst[12]);
				var invoice_status = resultSet[i].getValue(searchEst[14]);
				var JE_Status = resultSet[i].getValue(searchEst[16]);
				//updating sales order based on so status & Invoice Status
				if (invoice_status.trim() == 'Paid In Full' && ( JE_Status != 'Yes' )) {
					nlapiLogExecution('DEBUG', "so id", 'value' + so_id);
					nlapiLogExecution('DEBUG', "Sales Rep", 'value' + sales_rep);
					nlapiLogExecution('DEBUG', "Comm ammount", 'value' + comm_ammount);
					nlapiLogExecution('DEBUG', "Invoice", 'value' + invoice_no);
					nlapiLogExecution('DEBUG', "Invoice Staus", 'value' + invoice_status);
					nlapiLogExecution('DEBUG', "JE Staus", 'value' + JE_Status);
					
					
					var date = new Date();     
					var quarter =  parseInt(date.getMonth() / 3 ) + 1 ;
					nlapiLogExecution('DEBUG', "Quarter", 'value' + quarter == 1 ? 4 : quarter-1);
					var emp_subsidary =  nlapiLookupField("employee", sales_rep, ["subsidiary"]);
					nlapiLogExecution('DEBUG', "Subsidary", 'value' + emp_subsidary.subsidiary);
					//creating Journal Entry with the Credit and Debit Accounts
					var jeRec = nlapiCreateRecord('journalentry',{recordmode: 'dynamic'});
					jeRec.setFieldValue('subsidiary',emp_subsidary.subsidiary.trim()); //defaults based on employee 
					jeRec.setFieldValue('custbody_invoice_no',invoice_no);
					jeRec.setFieldValue('memo','Commission for Fiscal Q '+quarter == 1 ? 4 : quarter-1+'');
					//jeRec.setFieldValue('memo','Commission for Fiscal Q '+quarter == 1 ? 1 : quarter-1+'');
					jeRec.setFieldValue('custbody_salesorder_no',so_id);
					jeRec.setFieldValue('currency',nlapiLookupField('subsidiary',emp_subsidary.subsidiary,'currency'));	
					
					// debit line
					jeRec.selectNewLineItem('line');
					jeRec.setCurrentLineItemValue('line', 'account', COMMISSION_DEBIT);
					jeRec.setCurrentLineItemValue('line', 'debit', comm_ammount);
					jeRec.setCurrentLineItemValue('line', 'entity', sales_rep);
					
					jeRec.commitLineItem('line');
					// credit line
					jeRec.selectNewLineItem('line');
					jeRec.setCurrentLineItemValue('line', 'account', COMMISSION_CREDIT);
					jeRec.setCurrentLineItemValue('line', 'credit', comm_ammount);
					jeRec.setCurrentLineItemValue('line', 'entity', sales_rep);
					jeRec.commitLineItem('line');

					var JeRec_Id = nlapiSubmitRecord(jeRec);	
					nlapiLogExecution('DEBUG', "JE id", 'value' + JeRec_Id);
					
					// update the sales order to journal entry completed
					nlapiSubmitField('salesorder',so_id,'custbody43','T'); 
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