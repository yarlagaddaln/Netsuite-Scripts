/*************************************************************************
 * AUTHOR : LAKSHMI
 * AXIOMA INC CONFIDENTIAL
 * __________________
 *
 *  [2017] - [2018] AXIOMA INC
 *  All Rights Reserved.
 *
 * USER EVENT SCRIPT TO MODEL ACV FROM A SALES ORDER CREATE ACV RECORD ON THE FLY BASED ON NO OF SALESREPS * NO OF YeaRS
 * the property of AXIOMA INC,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to AXIOMA INC
 * and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from AXIOMA INC.
 */

//create ACV record from the Model ACV
function CreateACV_SO_New(type) {
	
	nlapiLogExecution('DEBUG','type',type);
	
	var acv_per_rep = 0;
        var customer_name = '';
        var salesorder = '';
        var estimate_no = '';
        var startdate = '';
        var enddate = '';
        var partner = '';
        var optout = '';
        var total_acv = 0;
        var acv_per_year_rep = 0;
        var rep_last_acv = 0;
        var rep_current_acv = 0;
        var acv_per_year_rep_renewal = 0;
        var acv_per_year_rep_upsell = 0;
        var acv_per_year_rep_contract_upsell = 0;
        var acv_per_year_rep_shrinkage = 0;
        var acv_per_year_rep_cancellation = 0;
        var acv_per_year_rep_breakdown = 0;
        var acv_year1 = 0;
    if (type == 'create') {
        
        try {
            //Obtain a handle to the newly created Model ACV Record
            var ACVModel = nlapiGetNewRecord();
            var ACVModel_recInternalId = ACVModel.getId();
			
            //get the estimate number
            ACVModel.getFieldValue('createdfrom');
            //get the customer
            ACVModel.getFieldValue('custrecord_macv_customer');
            //get sales order id
            ACVModel.getFieldValue('custrecord_macv_sales_order_num');
            //get partner name
            ACVModel.getFieldValue('custrecord_macv_partner');
            //get product category
            ACVModel.getFieldValue('custrecord_macv_prod_catergory');
            //get opt out date
            ACVModel.getFieldValue('custrecord_macv_optout');

            var no_of_years = ACVModel.getFieldValue('custrecord_no_of_years');
            var no_of_reps = ACVModel.getFieldValue('custrecord_no_of_reps');

            var acv_new = 0, acv_renewal = 0, acv_upsell = 0, acv_contract_upsell = 0, acv_cancellation = 0, acv_shrinkage = 0, acv_total_acv = 0;

            //nlapiLogExecution('DEBUG', 'No of Reps', 'Count= ' + no_of_reps);
            //nlapiLogExecution('DEBUG', 'No of Years', 'Deal= ' + no_of_years);
            //loop through the no of years
            for (i = 1; i <= parseInt(no_of_years); i++) {

                //getting the start date end date and acvs per year
                //nlapiLogExecution('DEBUG', 'Year Start', 'Date= ' + ACVModel.getFieldValue('custrecord_macv_start_date_id' + i));
                //nlapiLogExecution('DEBUG', 'Year End', 'Date= ' + ACVModel.getFieldValue('custrecord_macv_end_date_id' + i));

                total_acv = parseFloat(ACVModel.getFieldValue('custrecord_macv_total_acv_id' + i));

                //loop through the no of reps
                for (j = 1; j <= parseInt(no_of_reps); j++) {

                    acv_per_current_rep =  parseFloat(ACVModel.getFieldValue('custrecord_macv_allocation_id' + j));

                    acv_per_year_rep = Math.abs(parseFloat(total_acv) * parseInt(acv_per_current_rep) / 100);
                    nlapiLogExecution('DEBUG', 'ACV Year :"' + i + '" & Rep :"' + j + '"', 'ACV=' + Math.round(acv_per_year_rep));
                    //Create a new blank instance of a ACV Forecast
                    var acv_rec = nlapiCreateRecord("customrecord184", {
                        recordmode: 'dynamic'
                    });

                    //setting sales rep
                    acv_rec.setFieldValue('custrecord_acv_sales_rep', ACVModel.getFieldValue('custrecord_macv_sr_id'+j));

                    //setting up sales rep region
                    acv_rec.setFieldValue('custrecord_acv_region', ACVModel.getFieldValue('custrecord_macv_reg_id'+j));


                    //setting customer
                    acv_rec.setFieldValue('custrecord_acv_customer', ACVModel.getFieldValue('custrecord_macv_customer'));

                    //setting sales order
                    acv_rec.setFieldValue('custrecord_acv_sales_order_num', ACVModel.getFieldValue('custrecord_macv_sales_order_num'));

                    //setting Estimate number
                    acv_rec.setFieldValue('custrecord_acv_estimate_num', ACVModel.getFieldValue('custrecord_macv_estimate'));

                    //setting Start Date
                    acv_rec.setFieldValue('custrecord_acv_start_date', ACVModel.getFieldValue('custrecord_macv_start_date_id' + i));

                    //setting End Date
                    acv_rec.setFieldValue('custrecord_acv_end_date', ACVModel.getFieldValue('custrecord_macv_end_date_id' + i));

                    //setting Partner
                    acv_rec.setFieldValue('custrecord_acv_partner', ACVModel.getFieldValue('custrecord_macv_partner'));

                    //setting Allocation Per Rep/Year
                    acv_rec.setFieldValue('custrecord_acv_allocation_prcnt', acv_per_current_rep);

                    //setting product category
                    acv_rec.setFieldValue('custrecord_acv_product_category', ACVModel.getFieldValue('custrecord_macv_prod_catergory'));

                    //settign opt out date
                    acv_rec.setFieldValue('custrecord_acv_optout_date', ACVModel.getFieldValue('custrecord_macv_optout'));

                    //setting up New ACV value
                    //get new value
	
					acv_rec.setFieldValue('custrecord_macv_id',  ACVModel_recInternalId);
					acv_rec.setFieldValue('custrecord_acv_approved','T');
					if(parseInt(acv_per_current_rep)>0){
					var disc_per_rep = parseFloat(ACVModel.getFieldValue('custrecord_macv_discount_id'+i))*parseInt(acv_per_current_rep)/100;
					acv_rec.setFieldValue('custrecord_acv_discount', disc_per_rep);
					acv_rec.setFieldValue('custrecord_acv_new', ACVModel.getFieldValue('custrecord_macv_new_id'+i));
					acv_rec.setFieldValue('custrecord_acv_renewal', ACVModel.getFieldValue('custrecord_macv_renewal_id'+i));
					acv_rec.setFieldValue('custrecord_acv_upsell', ACVModel.getFieldValue('custrecord_macv_upsell_id'+i));
					acv_rec.setFieldValue('custrecord_acv_cont_upsell', ACVModel.getFieldValue('custrecord_macv_cont_upsell_id'+i));
					acv_rec.setFieldValue('custrecord_acv_cancellation', ACVModel.getFieldValue('custrecord_macv_cancel_id'+i));
					acv_rec.setFieldValue('custrecord_acv_shrinkage', ACVModel.getFieldValue('custrecord_macv_shrinkage_id'+i));
					var alloc_per_rep =  parseFloat(ACVModel.getFieldValue('custrecord_macv_total_acv_id'+i)) * parseInt(acv_per_current_rep)/100;
					acv_rec.setFieldValue('custrecord_acv_total_acv', alloc_per_rep);	
					}

                  acv_rec.setFieldValue('custrecord_acv_note',ACVModel.getFieldValue('custrecord_macv_note'));
                  acv_rec.setFieldValue('custrecord_so_memo',ACVModel.getFieldValue('custrecord_macv_so_memo'));
				  acv_rec.setFieldValue('custrecord_acv_non_acv_rev',ACVModel.getFieldValue('custrecord_macv_non_acv_rev'));
                  
                  
                    try {
                        //committing the ACV record to the database
                        var acvid = nlapiSubmitRecord(acv_rec, true);
						nlapiSubmitField('salesorder', ACVModel.getFieldValue('custrecord_macv_sales_order_num'), 'custbody_so_macv_id', ACVModel_recInternalId);
						//nlapiSubmitField('salesorder', ACVModel.getFieldValue('custrecord_macv_sales_order_num'), 'exportCheck', 'T');
                        nlapiLogExecution('DEBUG', 'ACV record created successfully', 'ID = ' + acvid);
						
                    } catch (e) {
						nlapiLogExecution('ERROR', 'here','i m here1');
                        nlapiLogExecution('ERROR', e.getCode(), e.getDetails());
                    }
                }

            }
        }
        catch (e) {
			nlapiLogExecution('ERROR', 'here','i m here2');
            nlapiLogExecution('ERROR', e.getCode(), e.getDetails());
        }


    }
	
	// when editing model acv from SO
	if(type=='edit'){
		nlapiLogExecution('DEBUG', 'Type', 'IS = ' + type);
		//get current model acv record id
		var acv_id = nlapiGetRecordId();
		//find the existing acv that are linked to the model acv
		// Create a search for inventory items with their thumbnails to be displayed on the PDF 
		var filter = new Array();
		filter[0] = new nlobjSearchFilter('custrecord_macv_id', null, 'equalto', acv_id);
		var columns = new Array();
		columns[0] = new nlobjSearchColumn('custrecord_acv_sales_order_num'); //using join: message.subject column
		columns[1] = new nlobjSearchColumn('custrecord_acv_sales_rep'); //using join: message.messageDate column
		var search = nlapiSearchRecord('customrecord184',null,filter,columns);
		for(var i in search)
		{
			//delete all the ACV records that are relate to current acv model to create new records
			nlapiDeleteRecord('customrecord184',search[i].getId());
		}
		
		//creating new acv records based on the new acv model
        try {
            //Obtain a handle to the newly created Model ACV Record
            var ACVModel = nlapiGetNewRecord();
            var ACVModel_recInternalId = ACVModel.getId();
			
            //get the estimate number
            ACVModel.getFieldValue('createdfrom');
            //get the customer
            ACVModel.getFieldValue('custrecord_macv_customer');
            //get sales order id
            ACVModel.getFieldValue('custrecord_macv_sales_order_num');
            //get partner name
            ACVModel.getFieldValue('custrecord_macv_partner');
            //get product category
            ACVModel.getFieldValue('custrecord_macv_prod_catergory');
            //get opt out date
            ACVModel.getFieldValue('custrecord_macv_optout');

            var no_of_years = ACVModel.getFieldValue('custrecord_no_of_years');
            var no_of_reps = ACVModel.getFieldValue('custrecord_no_of_reps');

            var acv_new = 0, acv_renewal = 0, acv_upsell = 0, acv_contract_upsell = 0, acv_cancellation = 0, acv_shrinkage = 0, acv_total_acv = 0;

            //nlapiLogExecution('DEBUG', 'No of Reps', 'Count= ' + no_of_reps);
            //nlapiLogExecution('DEBUG', 'No of Years', 'Deal= ' + no_of_years);
            //loop through the no of years
            for (i = 1; i <= parseInt(no_of_years); i++) {

                //getting the start date end date and acvs per year
                //nlapiLogExecution('DEBUG', 'Year Start', 'Date= ' + ACVModel.getFieldValue('custrecord_macv_start_date_id' + i));
                //nlapiLogExecution('DEBUG', 'Year End', 'Date= ' + ACVModel.getFieldValue('custrecord_macv_end_date_id' + i));

                total_acv = parseFloat(ACVModel.getFieldValue('custrecord_macv_total_acv_id' + i));

                //loop through the no of reps
                for (j = 1; j <= parseInt(no_of_reps); j++) {

                    acv_per_current_rep =  parseFloat(ACVModel.getFieldValue('custrecord_macv_allocation_id' + j));

                    acv_per_year_rep = Math.abs(parseFloat(total_acv) * parseInt(acv_per_current_rep) / 100);
                    nlapiLogExecution('DEBUG', 'ACV Year :"' + i + '" & Rep :"' + j + '"', 'ACV=' + Math.round(acv_per_year_rep));
                    //Create a new blank instance of a ACV Forecast
                    var acv_rec = nlapiCreateRecord("customrecord184", {
                        recordmode: 'dynamic'
                    });

                    //setting sales rep
                    acv_rec.setFieldValue('custrecord_acv_sales_rep', ACVModel.getFieldValue('custrecord_macv_sr_id'+j));

                    //setting up sales rep region
                    acv_rec.setFieldValue('custrecord_acv_region', ACVModel.getFieldValue('custrecord_macv_reg_id'+j));


                    //setting customer
                    acv_rec.setFieldValue('custrecord_acv_customer', ACVModel.getFieldValue('custrecord_macv_customer'));

                    //setting sales order
                    acv_rec.setFieldValue('custrecord_acv_sales_order_num', ACVModel.getFieldValue('custrecord_macv_sales_order_num'));

                    //setting Estimate number
                    acv_rec.setFieldValue('custrecord_acv_estimate_num', ACVModel.getFieldValue('custrecord_macv_estimate'));

                    //setting Start Date
                    acv_rec.setFieldValue('custrecord_acv_start_date', ACVModel.getFieldValue('custrecord_macv_start_date_id' + i));

                    //setting End Date
                    acv_rec.setFieldValue('custrecord_acv_end_date', ACVModel.getFieldValue('custrecord_macv_end_date_id' + i));

                    //setting Partner
                    acv_rec.setFieldValue('custrecord_acv_partner', ACVModel.getFieldValue('custrecord_macv_partner'));

                    //setting Allocation Per Rep/Year
                    acv_rec.setFieldValue('custrecord_acv_allocation_prcnt', acv_per_current_rep);

                    //setting product category
                    acv_rec.setFieldValue('custrecord_acv_product_category', ACVModel.getFieldValue('custrecord_macv_prod_catergory'));

                    //settign opt out date
                    acv_rec.setFieldValue('custrecord_acv_optout_date', ACVModel.getFieldValue('custrecord_macv_optout'));

                    //setting up New ACV value
                    //get new value
	
					acv_rec.setFieldValue('custrecord_macv_id',  ACVModel_recInternalId);
					acv_rec.setFieldValue('custrecord_acv_approved','T');
					if(parseInt(acv_per_current_rep)>0){
					var disc_per_rep = parseFloat(ACVModel.getFieldValue('custrecord_macv_discount_id'+i))*parseInt(acv_per_current_rep)/100;
					acv_rec.setFieldValue('custrecord_acv_discount', disc_per_rep);
					acv_rec.setFieldValue('custrecord_acv_new', ACVModel.getFieldValue('custrecord_macv_new_id'+i));
					acv_rec.setFieldValue('custrecord_acv_renewal', ACVModel.getFieldValue('custrecord_macv_renewal_id'+i));
					acv_rec.setFieldValue('custrecord_acv_upsell', ACVModel.getFieldValue('custrecord_macv_upsell_id'+i));
					acv_rec.setFieldValue('custrecord_acv_cont_upsell', ACVModel.getFieldValue('custrecord_macv_cont_upsell_id'+i));
					acv_rec.setFieldValue('custrecord_acv_cancellation', ACVModel.getFieldValue('custrecord_macv_cancel_id'+i));
					acv_rec.setFieldValue('custrecord_acv_shrinkage', ACVModel.getFieldValue('custrecord_macv_shrinkage_id'+i));
					var alloc_per_rep =  parseFloat(ACVModel.getFieldValue('custrecord_macv_total_acv_id'+i)) * parseInt(acv_per_current_rep)/100;
					acv_rec.setFieldValue('custrecord_acv_total_acv', alloc_per_rep);	
					}

                  acv_rec.setFieldValue('custrecord_acv_note',ACVModel.getFieldValue('custrecord_macv_note'));
                  acv_rec.setFieldValue('custrecord_so_memo',ACVModel.getFieldValue('custrecord_macv_so_memo'));
                  acv_rec.setFieldValue('custrecord_acv_non_acv_rev',ACVModel.getFieldValue('custrecord_macv_non_acv_rev'));
                  
                    try {
                        //committing the ACV record to the database
                        var acvid = nlapiSubmitRecord(acv_rec, true);
						nlapiSubmitField('salesorder', ACVModel.getFieldValue('custrecord_macv_sales_order_num'), 'custbody_so_macv_id', ACVModel_recInternalId);
						//nlapiSubmitField('salesorder', ACVModel.getFieldValue('custrecord_macv_sales_order_num'), 'exportCheck', 'T');
                        nlapiLogExecution('DEBUG', 'ACV record created successfully', 'ID = ' + acvid);
						
                    } catch (e) {
						nlapiLogExecution('ERROR', 'here','i m here1');
                        nlapiLogExecution('ERROR', e.getCode(), e.getDetails());
                    }
                }

            }
        }
        catch (e) {
			nlapiLogExecution('ERROR', 'here','i m here2');
            nlapiLogExecution('ERROR', e.getCode(), e.getDetails());
        }
		
	}
}