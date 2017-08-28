/* Scheduled script to set the next bill date. This uses the search, Estimate NextBillDate - https://system.sandbox.netsuite.com/app/common/search/searchresults.nl?searchid=1926&whence= loops through to see if a date has expired, to set the next date..*/

function updateNextBillDate(type)
{
	var search = nlapiLoadSearch('estimate', 'customsearch_estimate_nextbilldate');
	var searchResults = search.runSearch();
  
	nlapiLogExecution('audit',"after runSearch");

	// resultIndex points to record starting current resultSet in the entire results array 
	var resultIndex = 0; 
	var resultStep = 1000; // Number of records returned in one step (maximum is 1000)
	var resultSet; // temporary variable used to store the result set
	do 
	{
		// fetch one result set
		resultSet = searchResults.getResults(resultIndex, resultIndex + resultStep);

      nlapiLogExecution('audit',"ResultSet: ", resultSet.length);

		// increase pointer
		resultIndex = resultIndex + resultStep;

		// process or log the results
		if(resultSet){
			for (var i=0; i<resultSet.length; i++)
			{
				var searchEst = resultSet[i];
					   
//				var opt_out_val = searchEst.getValue( 'custbody_opt_out' );
//				var date_out_val = searchEst.getValue( 'custbody21' );
//              					nlapiLogExecution('audit',"opt_out_val",opt_out_val);


				/* var date_1st_val = searchEst.getValue( 'custbody_1st_license_issue' );
				var date_2st_val = searchEst.getValue( 'custbody_2nd_license_issue' );
				var date_3st_val = searchEst.getValue( 'custbody_3rd_license_issue' );
				var date_4th_val = searchEst.getValue( 'custbody_4th_license_issue' );
              	var date_5th_val = searchEst.getValue( 'custbody_5th_license_issue' );
                var last_val = searchEst.getValue('custbody_last_license_issue'); */
              //get the rep
			  //nlapiLogExecution('audit','estimate#',searchEst.getId());
             var EStRec =  nlapiLoadRecord('estimate', searchEst.getId());
               var sales_rep = '';
              var get_sales_team_count = EStRec.getLineItemCount('salesteam');
			  var tranid =  EStRec.getFieldValue('tranid');
               nlapiLogExecution('audit','sale team#',get_sales_team_count);
			   if(get_sales_team_count >= 1){
				  for(j=1;j <= get_sales_team_count;j++){
                if(EStRec.getLineItemValue('salesteam', 'isprimary',j)=='T')
                  sales_rep = EStRec.getLineItemValue('salesteam', 'employee',j);
				   nlapiLogExecution('audit',"rep id",sales_rep);
				} 
			   }
              
              //var sales_rep = EStRec.getFieldValue( 'salesrep' );
              if( sales_rep!='' && sales_rep!='undefined' && get_sales_team_count > 0){
				  
                 var sales_rep_status = nlapiLookupField('employee',sales_rep,'isinactive');
				 //checking employee status
				 if(sales_rep_status == 'T' ){
					nlapiLogExecution('audit',"Rep name",nlapiLookupField('employee',sales_rep,'entityid'));
					nlapiLogExecution('audit',"rep active?",sales_rep_status);
                 nlapiLogExecution('audit',"Rouge Estimate internal id",searchEst.getId());
				 nlapiLogExecution('audit',"Rouge Estimate number",tranid); 
				 }
				 else{
					 nlapiLogExecution('audit',"Rep name",EStRec.getFieldValue('salesrep'));
					 nlapiLogExecution('audit',"rep active ?",sales_rep_status);
					 nlapiLogExecution('audit',"Estimate internal id",searchEst.getId());
					nlapiLogExecution('audit',"Estimate number",tranid); 
				 }

				 
              }
/* 			else{
				 //var sales_rep_status = nlapiLookupField('employee',sales_rep,'isinactive');
				nlapiLogExecution('audit',"Rep name ",nlapiLookupField('employee',sales_rep,'entityid'));
				nlapiLogExecution('audit',"Rep actvie? ",nlapiLookupField('employee',sales_rep,'isinactive');
                 nlapiLogExecution('audit',"Rouge Estimate internal id",searchEst.getId());
				 nlapiLogExecution('audit',"Estimate number",tranid);
			} */

				// Get the remaining usage points of the scripts
				var usage = nlapiGetContext().getRemainingUsage();

				// If the script's remaining usage points are bellow 1,000 ...       
				if (usage < 100) 
				{
					// ...yield the script
					var state = nlapiYieldScript();
					// Throw an error or log the yield results
					if (state.status == 'FAILURE'){
						nlapiLogExecution("debug","Failed to yield script (do-while), exiting: Reason = "+ state.reason + " / Size = "+ state.size); 
						  throw "Failed to yield script"; 
					}
					else if (state.status == 'RESUME')
						nlapiLogExecution('DEBUG','Resuming script');
				}

			}
		}
	// once no records are returned we already got all of them
	} while (resultSet.length > 0);

}
