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
function BeforeLoad_SO(type, form) {
	nlapiLogExecution('DEBUG', 'Type', 'IS = ' + type);
		try {
        var params = request.getAllParameters();
        var so_id = '';
        var acv_year1 = '';
        var acv_year2 = '';
        var acv_year3 = '';
        var acv_year4 = '';
        var upsell = '';
        var deal_no_of_years = '';
        var discount_total = '';
        var acv_total_year = 0;
		var shrinkage='';

        for (param in params) {
            if (param == 'so_id') {

                //get the SO id from the url
                //nlapiLogExecution('DEBUG', 'value: ' + params[param]);
                so_id = params[param];
            }
        }

        // get the type of the record
        var model_acv_record_type = nlapiGetRecordType();
        //nlapiLogExecution('DEBUG', 'REcord Type', 'Type# = ' + model_acv_record_type);

        //load the SO record to retrive the details..
        var salesorder_info = nlapiLoadRecord('salesorder', so_id);

        //setting up the Primary populate fields..

        //get the sales order number
        //nlapiLogExecution('DEBUG', 'Sales Order', 'SO# = ' + salesorder_info.getFieldValue('tranid'));
        nlapiSetFieldValue('custrecord_macv_sales_order_num', so_id);

        // get the estimate number
        var estimate_no = salesorder_info.getFieldValue('createdfrom');
        //nlapiLogExecution('DEBUG', 'Sales Order', 'EST# = ' + salesorder_info.getFieldValue('createdfrom'));
        nlapiSetFieldValue('custrecord_macv_estimate', salesorder_info.getFieldValue('createdfrom'));

        // get the customer name
        //nlapiLogExecution('DEBUG', 'Sales Oder', 'Customer = ' + salesorder_info.getFieldValue('entity'));
        nlapiSetFieldValue('custrecord_macv_customer', salesorder_info.getFieldValue('entity'));

        //get the start date of deal
        //nlapiLogExecution('DEBUG', 'Sales Oder', 'Start date = ' + salesorder_info.getFieldValue('startdate'));
        nlapiSetFieldValue('custrecord_macv_start_date', salesorder_info.getFieldValue('startdate'));

        //get the end date of deal
        //nlapiLogExecution('DEBUG', 'Sales Oder', 'End date = ' + salesorder_info.getFieldValue('enddate'));
        nlapiSetFieldValue('custrecord_macv_end_date', salesorder_info.getFieldValue('enddate'));

        //get the deal opt out date
        //nlapiLogExecution('DEBUG', 'Sales Oder', 'Opt out date = ' + salesorder_info.getFieldValue('custbody21'));
        nlapiSetFieldValue('custrecord_macv_optout', salesorder_info.getFieldValue('custbody21'));

        //get partner name
        //nlapiLogExecution('DEBUG', 'Sales Oder', 'Partner = ' + salesorder_info.getFieldValue('partner'));
        nlapiSetFieldValue('custrecord_macv_partner', salesorder_info.getFieldValue('partner'));

        //Loading Estimate to get product category
		if(estimate_no){
		var estimate_info = nlapiLoadRecord('estimate', estimate_no);
        var product_category = estimate_info.getFieldValue('custbody22');
		}

        //nlapiLogExecution('DEBUG', 'Product Category', 'Product Category = ' + product_category);
        nlapiSetFieldValue('custrecord_macv_prod_catergory', product_category);

        //setting the total SO amount after discount
        nlapiSetFieldValue('custrecord_macv_total_so_amount', salesorder_info.getFieldValue('total'));

        //getting the discount total
        var total_discounts = parseInt(salesorder_info.getLineItemCount('item'));
        //nlapiLogExecution('DEBUG', 'Line items', 'count= ' + total_discounts);

        //getting sales reps
        var total_reps = salesorder_info.getLineItemCount('salesteam');
        //nlapiLogExecution('DEBUG', 'Sales Reps', 'Total = ' + total_reps);
          
		//setting memo field
           nlapiSetFieldValue('custrecord_macv_so_memo', salesorder_info.getFieldValue('memo'));
          
        //loop through the sales team to get details,allocation
        for (i = 1; i <= total_reps; i++) {
            var rep_id = salesorder_info.getLineItemValue('salesteam', 'employee', i);
            var rep_contribution = salesorder_info.getLineItemValue('salesteam', 'contribution', i);
            //set the sales rep_
            nlapiSetFieldValue('custrecord_macv_sr_id' + i, rep_id);
            // Loading Employee Record to get Sales Rep Region,Divison
            var salesrep_info = nlapiLoadRecord('employee', rep_id);
            //set the sales rep region
            var rep_region = salesrep_info.getFieldValue('custentity63');
            nlapiSetFieldValue('custrecord_macv_reg_id' + i, rep_region);
            //set sales rep divison
            var rep_divison = salesrep_info.getFieldValue('custentity61');
            nlapiSetFieldValue('custrecord_macv_division_id' + i, rep_divison);
            //set sales rep contribution
            var s = rep_contribution;
            s = parseInt(s.replace(/\d+% ?/g, ""));
            nlapiSetFieldValue('custrecord_macv_allocation_id' + i, s);
        }

        // decomposing the deal based on the years
        var deal_start = salesorder_info.getFieldValue('startdate');
        var deal_end = salesorder_info.getFieldValue('enddate');
        var diff_between_deals = '';
        if (deal_start && deal_end) {
            var startdate = new Date(deal_start).getTime();
            var enddate = new Date(deal_end).getTime();
            diff_between_deals = Math.abs(startdate - enddate) / (24 * 60 * 60 * 1000);
            //nlapiLogExecution('DEBUG', 'Years', 'Years = ' + Math.abs(startdate - enddate) / (24 * 60 * 60 * 1000));
        }
        if (diff_between_deals <= 366) {
            deal_no_of_years = 1;
        } else if (diff_between_deals <= 731 && diff_between_deals > 366) {
            deal_no_of_years = 2;
        } else if (diff_between_deals <= 1097 && diff_between_deals > 731) {
            deal_no_of_years = 3;
        } else if (diff_between_deals <= 1462 && diff_between_deals > 1097) {
            deal_no_of_years = 4;
        }

        // loop through the times no of years the deal is
        for (k = 1; k <= deal_no_of_years; k++) {
            //nlapiLogExecution('DEBUG', 'No of years', 'Year =' + k);
            // set years if the deal is less than a year
            if (deal_no_of_years == 1) {
                var c = deal_start;
                var g = deal_end;
                //Setting the Start date field on the ACV record
                nlapiSetFieldValue('custrecord_macv_start_date_id' + k, c);
                //nlapiLogExecution('DEBUG', 'Strat date for ' + k + ' year', 'Start date = ' + c);

                //Setting the End date field on the ACV record
                nlapiSetFieldValue('custrecord_macv_end_date_id' + k, g);
                //nlapiLogExecution('DEBUG', 'End date for ' + k + ' year', 'End date = ' + g);
            } else {
                //set years based on start & end date if the deal is more than a year
                var d = new Date(deal_start);
                var year = d.getFullYear() + k;
                var year_check = d.getFullYear() + k;
                var month = d.getMonth() + 1;
                var month_check = d.getMonth() + 1;
                var day = d.getDate();
                var day_check = d.getDate();
                var c = month + '/' + day + '/' + year;

                var r = new Date(c);
                var year = r.getFullYear() - 1;
                var month = r.getMonth() + 1;
                var day = r.getDate();
                var g = month + '/' + day + '/' + year;
				
				//setting custom deal 
				var validate_customdate = new Date(c);
				var validate_actualend = new Date(deal_end);
				if(validate_customdate.getFullYear()> validate_actualend.getFullYear()){
					//nlapiLogExecution('DEBUG', 'End date','Greater');
					//nlapiLogExecution('DEBUG', 'Strat date for ' + k + ' year', 'Start date = ' + g);
                nlapiSetFieldValue('custrecord_macv_end_date_id' + k, deal_end);
				}
				else{
				//nlapiLogExecution('DEBUG', 'Strat date for ' + k + ' year', 'Start date = ' + g);
                nlapiSetFieldValue('custrecord_macv_end_date_id' + k, c);
				}

                //Setting the Start date field on the ACV record
                nlapiSetFieldValue('custrecord_macv_start_date_id' + k, g);
               
            }
        }


        var y = 1;
        for (j = 1; j <= total_discounts; j++) {

            //get only the discounts
            if (salesorder_info.getLineItemValue('item', 'itemtype', j) == 'Discount') {
                //nlapiLogExecution('DEBUG', 'Discount', 'count= ' + salesorder_info.getLineItemValue('item', 'amount', j));
                discount_total = parseInt(discount_total + Math.abs(salesorder_info.getLineItemValue('item', 'amount', j)));
                nlapiSetFieldValue('custrecord_macv_discount_id' + y, Math.abs(salesorder_info.getLineItemValue('item', 'amount', j)));
            }
            // breaking down the ACV per year on Rep allocation by looping through the items list on SO
            //get only the subtotals i.e ACV per year
            if (salesorder_info.getLineItemText('item', 'item', j) == 'Subtotal') {

                if (y == 1) {
                    acv_year1 = Number(salesorder_info.getLineItemValue('item', 'amount', j));
                    nlapiSetFieldValue('custrecord_macv_new_id' + y, acv_year1);
                    acv_total_year = parseInt(nlapiGetFieldValue('custrecord_macv_new_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_renewal_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_upsell_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_cont_upsell_id' + y)) - parseInt(nlapiGetFieldValue('custrecord_macv_cancel_id' + y)) - parseInt(nlapiGetFieldValue('custrecord_macv_shrinkage_id' + y));
                    nlapiSetFieldValue('custrecord_macv_total_acv_id' + y, Math.abs(acv_total_year));

                }
                if (y == 2) {
                    acv_year2 = Number(salesorder_info.getLineItemValue('item', 'amount', j));
                    //year 2 acv is year 1 end acv
                    //nlapiSetFieldValue('custrecord_macv_new_id'+y, acv_year1);
					
                    // upsell
                    if (acv_year1 < acv_year2) {

                        nlapiSetFieldValue('custrecord_macv_renewal_id' + y, acv_year1);
                        upsell = acv_year2 - acv_year1;
                        nlapiSetFieldValue('custrecord_macv_cont_upsell_id' + y, upsell);
						nlapiLogExecution('DEBUG', 'HERE upsell', 'value= ' +acv_year2+','+acv_year1 );

                    }
                    //shrinkage
                    if (acv_year2 < acv_year1) {
						shrinkage='';
						 shrinkage = acv_year1-acv_year2;
						nlapiSetFieldValue('custrecord_macv_renewal_id' + y, acv_year1);
                        nlapiSetFieldValue('custrecord_macv_shrinkage_id' + y, shrinkage);
						nlapiLogExecution('DEBUG', 'HERE upsell', 'value= ' +acv_year2+','+acv_year1 );
                    }


                    acv_total_year = parseInt(nlapiGetFieldValue('custrecord_macv_new_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_renewal_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_upsell_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_cont_upsell_id' + y)) - parseInt(nlapiGetFieldValue('custrecord_macv_cancel_id' + y)) - parseInt(nlapiGetFieldValue('custrecord_macv_shrinkage_id' + y));

                    nlapiSetFieldValue('custrecord_macv_total_acv_id' + y, Math.abs(acv_total_year));
                }
                if (y == 3) {
                    acv_year3 = Number(salesorder_info.getLineItemValue('item', 'amount', j));
                    //year 3 acv is year 2 end acv
                    //nlapiSetFieldValue('custrecord_macv_new_id'+y, acv_year2);
                    // upsell
                    if (acv_year2 < acv_year3) {

                        nlapiSetFieldValue('custrecord_macv_renewal_id' + y, acv_year2);
                        upsell = acv_year3 - acv_year2;
                        nlapiSetFieldValue('custrecord_macv_cont_upsell_id' + y, upsell);

                    }
                    //shrinkage
                    if (acv_year3 < acv_year2) {
						shrinkage='';
						 shrinkage = parseFloat(acv_year2)-parseFloat(acv_year3);
						 nlapiSetFieldValue('custrecord_macv_renewal_id' + y, acv_year2);
                         nlapiSetFieldValue('custrecord_macv_shrinkage_id' + y, shrinkage);
						
                    }

                    acv_total_year = parseInt(nlapiGetFieldValue('custrecord_macv_new_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_renewal_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_upsell_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_cont_upsell_id' + y)) - parseInt(nlapiGetFieldValue('custrecord_macv_cancel_id' + y)) - parseInt(nlapiGetFieldValue('custrecord_macv_shrinkage_id' + y));
                    nlapiSetFieldValue('custrecord_macv_total_acv_id' + y, Math.abs(acv_total_year));
                }
                if (y == 4) {
                    acv_year4 = Number(salesorder_info.getLineItemValue('item', 'amount', j));
                    // upsell
                    if (acv_year3 < acv_year4) {
                        nlapiSetFieldValue('custrecord_macv_renewal_id' + y, acv_year3);
                        upsell = acv_year4 - acv_year3;
                        nlapiSetFieldValue('custrecord_macv_cont_upsell_id' + y, upsell);

                    }
                    //shrinkage
                    if (acv_year4 < acv_year3) {
                        shrinkage = acv_year3-acv_year4;
						 nlapiSetFieldValue('custrecord_macv_renewal_id' + y, acv_year3);
                         nlapiSetFieldValue('custrecord_macv_shrinkage_id' + y, shrinkage);
                    }
                    acv_total_year = parseInt(nlapiGetFieldValue('custrecord_macv_new_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_renewal_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_upsell_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_cont_upsell_id' + y)) - parseInt(nlapiGetFieldValue('custrecord_macv_cancel_id' + y)) - parseInt(nlapiGetFieldValue('custrecord_macv_shrinkage_id' + y));

                    nlapiSetFieldValue('custrecord_macv_total_acv_id' + y, Math.abs(acv_total_year));
                }

                y++;
            }

        }
        //setting total discount
        //nlapiLogExecution('DEBUG', 'Discount', 'count= ' + discount_total);
        nlapiSetFieldValue('custrecord_macv_so_discount', discount_total);
        nlapiSetFieldValue('custrecord_no_of_reps', total_reps);
        nlapiSetFieldValue('custrecord_no_of_years', deal_no_of_years);
        //nlapiLogExecution('DEBUG', 'reps', 'count= ' + total_reps);
        //nlapiLogExecution('DEBUG', 'years', 'count= ' + deal_no_of_years);
    }
    catch (e) {
        nlapiLogExecution('ERROR', e.getCode(), e.getDetails());
    }
    

}

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
                    //On year on there will be only New ACV
                    if (i == 1) {
                        acv_year1 = acv_per_year_rep;
                        acv_rec.setFieldValue('custrecord_acv_new', acv_year1);
                        acv_rec.setFieldValue('custrecord_acv_total_acv',  acv_year1);
						
						
                    }
                    else {
						 nlapiLogExecution('DEBUG', 'ACV Year :"' + i + '" & Rep :"' + j + '"', 'ACV=' + Math.round(acv_per_year_rep));
						 acv_rec.setFieldValue('custrecord_acv_total_acv', parseFloat(acv_per_year_rep));
						 
						 //setting up renewal
						 var renew_last_year_close = parseFloat(ACVModel.getFieldValue('custrecord_macv_total_acv_id'+parseInt(i-1)));
						 var new_current_year_renewal = renew_last_year_close * acv_per_current_rep / 100 ;
						 acv_rec.setFieldValue('custrecord_acv_renewal', parseFloat(new_current_year_renewal));
						
						//seeting upsell
						var upsell_current_year =  parseFloat(acv_per_year_rep)- parseFloat(new_current_year_renewal);

							 nlapiLogExecution('DEBUG','Upsell','Value:'+ ACVModel.getFieldValue('custrecord_macv_upsell_id'+i));
							 nlapiLogExecution('DEBUG','contract','Value:'+ ACVModel.getFieldValue('custrecord_macv_cont_upsell_id'+i));
							 nlapiLogExecution('DEBUG','cancel','Value:'+ ACVModel.getFieldValue('custrecord_macv_cancel_id'+i));
							 nlapiLogExecution('DEBUG','shrinkage','Value:'+ ACVModel.getFieldValue('custrecord_macv_shrinkage_id'+i));
							if(ACVModel.getFieldValue('custrecord_macv_upsell_id'+i)>0){
								acv_rec.setFieldValue('custrecord_acv_upsell', parseFloat(upsell_current_year));
							}
							if(ACVModel.getFieldValue('custrecord_macv_cont_upsell_id'+i)>0){
								acv_rec.setFieldValue('custrecord_acv_cont_upsell', parseFloat(upsell_current_year));
							}
							if(ACVModel.getFieldValue('custrecord_macv_cancel_id'+i)>0){
								acv_rec.setFieldValue('custrecord_acv_cancellation', parseFloat(Math.abs(upsell_current_year)));
							}
							if(ACVModel.getFieldValue('custrecord_macv_shrinkage_id'+i)>0){
								acv_rec.setFieldValue('custrecord_acv_shrinkage', parseFloat(Math.abs(upsell_current_year)));
							}	
                    }
					acv_rec.setFieldValue('custrecord_macv_id',  ACVModel_recInternalId);
					acv_rec.setFieldValue('custrecord_acv_approved','T');
					var disc_per_rep = parseFloat(ACVModel.getFieldValue('custrecord_macv_discount_id'+i))*parseInt(acv_per_current_rep)/100;
					acv_rec.setFieldValue('custrecord_acv_discount', disc_per_rep);
                  acv_rec.setFieldValue('custrecord_acv_note',ACVModel.getFieldValue('custrecord_macv_note'));
                  acv_rec.setFieldValue('custrecord_so_memo',ACVModel.getFieldValue('custrecord_macv_so_memo'));
                  
                  
                    try {
                        //committing the ACV record to the database
                        var acvid = nlapiSubmitRecord(acv_rec, true);
						nlapiSubmitField('salesorder', ACVModel.getFieldValue('custrecord_macv_sales_order_num'), 'custbody_so_macv_id', ACVModel_recInternalId);
						//nlapiSubmitField('salesorder', ACVModel.getFieldValue('custrecord_macv_sales_order_num'), 'exportCheck', 'T');
                        nlapiLogExecution('DEBUG', 'ACV record created successfully', 'ID = ' + acvid);
						
                    } catch (e) {
                        nlapiLogExecution('ERROR', e.getCode(), e.getDetails());
                    }
                }

            }
        }
        catch (e) {
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

            nlapiLogExecution('DEBUG', 'No of Reps', 'Count= ' + no_of_reps);
            nlapiLogExecution('DEBUG', 'No of Years', 'Deal= ' + no_of_years);
            //loop through the no of years
            for (i = 1; i <= parseInt(no_of_years); i++) {

                //getting the start date end date and acvs per year
                nlapiLogExecution('DEBUG', 'Year Start', 'Date= ' + ACVModel.getFieldValue('custrecord_macv_start_date_id' + i));
                nlapiLogExecution('DEBUG', 'Year End', 'Date= ' + ACVModel.getFieldValue('custrecord_macv_end_date_id' + i));

                total_acv = parseFloat(ACVModel.getFieldValue('custrecord_macv_total_acv_id' + i));

                //loop through the no of reps
                for (j = 1; j <= parseInt(no_of_reps); j++) {

                    acv_per_current_rep =  parseFloat(ACVModel.getFieldValue('custrecord_macv_allocation_id' + j));

                    acv_per_year_rep = Math.abs(parseFloat(total_acv) * parseInt(acv_per_current_rep) / 100);
                   
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
                    //On year on there will be only New ACV
                    if (i == 1) {
                        acv_year1 = acv_per_year_rep;
                        acv_rec.setFieldValue('custrecord_acv_new', acv_year1);
                        acv_rec.setFieldValue('custrecord_acv_total_acv',  acv_year1);
                    }
                    else {
						
						 nlapiLogExecution('DEBUG', 'ACV Year :"' + i + '" & Rep :"' + j + '"', 'ACV=' + Math.round(acv_per_year_rep));
						 acv_rec.setFieldValue('custrecord_acv_total_acv', parseFloat(acv_per_year_rep));
						 
						 //setting up renewal
						 var renew_last_year_close = parseFloat(ACVModel.getFieldValue('custrecord_macv_total_acv_id'+parseInt(i-1)));
						 var new_current_year_renewal = renew_last_year_close * acv_per_current_rep / 100 ;
						 acv_rec.setFieldValue('custrecord_acv_renewal', parseFloat(new_current_year_renewal));
						
						//seeting upsell
						var upsell_current_year =  parseFloat(acv_per_year_rep)- parseFloat(new_current_year_renewal);

							 nlapiLogExecution('DEBUG','Upsell','Value:'+ ACVModel.getFieldValue('custrecord_macv_upsell_id'+i));
							 nlapiLogExecution('DEBUG','contract','Value:'+ ACVModel.getFieldValue('custrecord_macv_cont_upsell_id'+i));
							 nlapiLogExecution('DEBUG','cancel','Value:'+ ACVModel.getFieldValue('custrecord_macv_cancel_id'+i));
							 nlapiLogExecution('DEBUG','shrinkage','Value:'+ ACVModel.getFieldValue('custrecord_macv_shrinkage_id'+i));
							if(ACVModel.getFieldValue('custrecord_macv_upsell_id'+i)>0){
								acv_rec.setFieldValue('custrecord_acv_upsell', parseFloat(upsell_current_year));
							}
							if(ACVModel.getFieldValue('custrecord_macv_cont_upsell_id'+i)>0){
								acv_rec.setFieldValue('custrecord_acv_cont_upsell', parseFloat(upsell_current_year));
							}
							if(ACVModel.getFieldValue('custrecord_macv_cancel_id'+i)>0){
								acv_rec.setFieldValue('custrecord_acv_cancellation', parseFloat(Math.abs(upsell_current_year)));
							}
							if(ACVModel.getFieldValue('custrecord_macv_shrinkage_id'+i)>0){
								acv_rec.setFieldValue('custrecord_acv_shrinkage', parseFloat(Math.abs(upsell_current_year)));
							}						

                    }
					acv_rec.setFieldValue('custrecord_macv_id',  ACVModel_recInternalId);
					acv_rec.setFieldValue('custrecord_acv_approved','T');
					var disc_per_rep = parseFloat(ACVModel.getFieldValue('custrecord_macv_discount_id'+i))*parseInt(acv_per_current_rep)/100;
					acv_rec.setFieldValue('custrecord_acv_discount', disc_per_rep);
                   acv_rec.setFieldValue('custrecord_acv_note',ACVModel.getFieldValue('custrecord_macv_note'));
                  acv_rec.setFieldValue('custrecord_so_memo',ACVModel.getFieldValue('custrecord_macv_so_memo'));
                    try {
                        //committing the ACV record to the database
                        var acvid = nlapiSubmitRecord(acv_rec, true);
						nlapiSubmitField('salesorder', ACVModel.getFieldValue('custrecord_macv_sales_order_num'), 'custbody_so_macv_id', ACVModel_recInternalId);
						//nlapiSubmitField('salesorder', ACVModel.getFieldValue('custrecord_macv_sales_order_num'), 'exportCheck', 'T');
                        nlapiLogExecution('DEBUG', 'ACV record created successfully', 'ID = ' + acvid);
						
                    } catch (e) {
                        nlapiLogExecution('ERROR', e.getCode(), e.getDetails());
                    }
                }

            }
        }
        catch (e) {
            nlapiLogExecution('ERROR', e.getCode(), e.getDetails());
        }
		
	}
}