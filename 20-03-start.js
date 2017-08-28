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

        for (param in params) {
            if (param == 'so_id') {

                //get the SO id from the url
                nlapiLogExecution('DEBUG', 'value: ' + params[param]);
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
        var estimate_info = nlapiLoadRecord('estimate', estimate_no);
        var product_category = estimate_info.getFieldValue('custbody22');
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

                //Setting the Start date field on the ACV record
                nlapiSetFieldValue('custrecord_macv_start_date_id' + k, g);
                //nlapiLogExecution('DEBUG', 'Strat date for ' + k + ' year', 'Start date = ' + g);
                nlapiSetFieldValue('custrecord_macv_end_date_id' + k, c);

                /*//handle custom deals so they never go out of actual start and end date
                 var orginal_enddate = new Date(deal_end);
                 //nlapiLogExecution('DEBUG','Original end date','date='+orginal_enddate.getFullYear());
                 //nlapiLogExecution('DEBUG','Script end date','date='+year_check);
                 if(orginal_enddate.getFullYear()>year_check || orginal_enddate.getMonth()>month_check){
                 //Setting the End date field on the ACV record
                 nlapiSetFieldValue('custrecord_macv_end_date_id' + k, deal_end);
                 //nlapiLogExecution('DEBUG', 'End date for ' + k + ' year', 'End date = ' + deal_end);
                 }
                 else{
                 //Setting the End date field on the ACV record
                 nlapiSetFieldValue('custrecord_macv_end_date_id' + k, c);
                 //nlapiLogExecution('DEBUG', 'End date for ' + k + ' year', 'End date = ' + c);
                 }*/

            }
        }


        var y = 1;
        for (j = 1; j <= total_discounts; j++) {

            //get only the discounts
            if (salesorder_info.getLineItemText('item', 'item', j) == 'Discount' || salesorder_info.getLineItemText('item', 'item', j) == 'Discount : Discount: Multi-year Discount') {
                //nlapiLogExecution('DEBUG', 'Discount', 'count= ' + salesorder_info.getLineItemValue('item', 'amount', j));
                discount_total = parseInt(discount_total + Math.abs(salesorder_info.getLineItemValue('item', 'amount', j)));
                nlapiSetFieldValue('custrecord_macv_discount_id' + y, Math.abs(salesorder_info.getLineItemValue('item', 'amount', j)));
            }
            // breaking down the ACV per year on Rep allocation by looping through the items list on SO
            //get only the subtotals i.e ACV per year
            if (salesorder_info.getLineItemText('item', 'item', j) == 'Subtotal') {

                if (y == 1) {
                    acv_year1 = salesorder_info.getLineItemValue('item', 'amount', j);
                    nlapiSetFieldValue('custrecord_macv_new_id' + y, acv_year1);
                    acv_total_year = parseInt(nlapiGetFieldValue('custrecord_macv_new_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_renewal_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_upsell_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_cont_upsell_id' + y)) - parseInt(nlapiGetFieldValue('custrecord_macv_cancel_id' + y)) - parseInt(nlapiGetFieldValue('custrecord_macv_shrinkage_id' + y));
                    nlapiSetFieldValue('custrecord_macv_total_acv_id' + y, Math.floor(acv_total_year));

                }
                if (y == 2) {
                    acv_year2 = salesorder_info.getLineItemValue('item', 'amount', j);
                    //year 2 acv is year 1 end acv
                    //nlapiSetFieldValue('custrecord_macv_new_id'+y, acv_year1);
                    // upsell
                    if (acv_year1 < acv_year2) {

                        nlapiSetFieldValue('custrecord_macv_renewal_id' + y, acv_year1);
                        upsell = acv_year2 - acv_year1;
                        nlapiSetFieldValue('custrecord_macv_upsell_id' + y, upsell);

                    }
                    //shrinkage
                    if (acv_year2 < acv_year1) {
                        nlapiSetFieldValue('custrecord_macv_shrinkage_id' + y, acv_year2);
                    }
                    //nlapiLogExecution('DEBUG', 'New', 'value' + parseInt(nlapiGetFieldValue('custrecord_macv_new_id' + y)));
                    //nlapiLogExecution('DEBUG', 'Renewal', 'value' + parseInt(nlapiGetFieldValue('custrecord_macv_renewal_id' + y)));
                    //nlapiLogExecution('DEBUG', 'Upsell', 'value' + parseInt(nlapiGetFieldValue('custrecord_macv_upsell_id' + y)));
                    //nlapiLogExecution('DEBUG', 'Contract Upsell', 'value' + parseInt(nlapiGetFieldValue('custrecord_macv_cont_upsell_id' + y)));
                    //nlapiLogExecution('DEBUG', 'Cancellation', 'value' + parseInt(nlapiGetFieldValue('custrecord_macv_cancel_id' + y)));
                    //nlapiLogExecution('DEBUG', 'Shrinkage', 'value' + parseInt(nlapiGetFieldValue('custrecord_macv_shrinkage_id' + y)));


                    acv_total_year = parseInt(nlapiGetFieldValue('custrecord_macv_new_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_renewal_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_upsell_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_cont_upsell_id' + y)) - parseInt(nlapiGetFieldValue('custrecord_macv_cancel_id' + y)) - parseInt(nlapiGetFieldValue('custrecord_macv_shrinkage_id' + y));

                    nlapiSetFieldValue('custrecord_macv_total_acv_id' + y, Math.floor(acv_total_year));
                }
                if (y == 3) {
                    acv_year3 = salesorder_info.getLineItemValue('item', 'amount', j);
                    //year 3 acv is year 2 end acv
                    //nlapiSetFieldValue('custrecord_macv_new_id'+y, acv_year2);
                    // upsell
                    if (acv_year2 < acv_year3) {

                        nlapiSetFieldValue('custrecord_macv_renewal_id' + y, acv_year2);
                        upsell = acv_year3 - acv_year2;
                        nlapiSetFieldValue('custrecord_macv_upsell_id' + y, upsell);

                    }
                    //shrinkage
                    if (acv_year3 < acv_year2) {
                        nlapiSetFieldValue('custrecord_macv_shrinkage_id' + y, acv_year3);
                    }

                    acv_total_year = parseInt(nlapiGetFieldValue('custrecord_macv_new_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_renewal_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_upsell_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_cont_upsell_id' + y)) - parseInt(nlapiGetFieldValue('custrecord_macv_cancel_id' + y)) - parseInt(nlapiGetFieldValue('custrecord_macv_shrinkage_id' + y));
                    nlapiSetFieldValue('custrecord_macv_total_acv_id' + y, acv_total_year);
                }
                if (y == 4) {
                    acv_year4 = salesorder_info.getLineItemValue('item', 'amount', j);
                    // upsell
                    if (acv_year3 < acv_year4) {
                        nlapiSetFieldValue('custrecord_macv_renewal_id' + y, acv_year3);
                        upsell = acv_year4 - acv_year3;
                        nlapiSetFieldValue('custrecord_macv_upsell_id' + y, upsell);

                    }
                    //shrinkage
                    if (acv_year4 < acv_year3) {
                        nlapiSetFieldValue('custrecord_macv_shrinkage_id' + y, acv_year4);
                    }
                    acv_total_year = parseInt(nlapiGetFieldValue('custrecord_macv_new_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_renewal_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_upsell_id' + y)) + parseInt(nlapiGetFieldValue('custrecord_macv_cont_upsell_id' + y)) - parseInt(nlapiGetFieldValue('custrecord_macv_cancel_id' + y)) - parseInt(nlapiGetFieldValue('custrecord_macv_shrinkage_id' + y));

                    nlapiSetFieldValue('custrecord_macv_total_acv_id' + y, acv_total_year);
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
    if (type == 'create' || type == 'edit') {
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

                total_acv = parseInt(ACVModel.getFieldValue('custrecord_macv_total_acv_id' + i));

                //loop through the no of reps
                for (j = 1; j <= parseInt(no_of_reps); j++) {

                    acv_per_rep =  parseInt(ACVModel.getFieldValue('custrecord_macv_allocation_id' + j));

                    acv_per_year_rep = Math.abs((parseInt(total_acv) * parseInt(acv_per_rep)) / 100);
                    nlapiLogExecution('DEBUG', 'ACV Year :"' + i + '" & Rep :"' + j + '"', 'ACV=' + Math.round(acv_per_year_rep));
                    //Create a new blank instance of a ACV Forecast
                    var acv_rec = nlapiCreateRecord("customrecord183", {
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
                    acv_rec.setFieldValue('custrecord_acv_allocation_prcnt', acv_per_rep);

                    //setting product category
                    acv_rec.setFieldValue('custrecord_acv_product_category', ACVModel.getFieldValue('custrecord_macv_prod_catergory'));

                    //settign opt out date
                    acv_rec.setFieldValue('custrecord_acv_optout_date', ACVModel.getFieldValue('custrecord_macv_optout'));

                    //setting up New ACV value
                    //On year on there will be only New ACV
                    if (i == 1) {
                        acv_year1 = acv_per_year_rep;
                        acv_rec.setFieldValue('custrecord_acv_new',  Math.round(acv_year1));
                        acv_rec.setFieldValue('custrecord_acv_total_acv',  Math.round(acv_year1));
                    }
                    else {
                        //set the current year Renewal rate to last year end ACV as Base for Renewal
                        rep_last_acv = parseInt(ACVModel.getFieldValue('custrecord_macv_total_acv_id'+parseInt(i-1)));
                        acv_per_year_rep_renewal = parseInt(Math.abs((parseInt(rep_last_acv) * parseInt(acv_per_rep)) / 100));
                        acv_rec.setFieldValue('custrecord_acv_renewal', parseInt( Math.round(acv_per_year_rep_renewal)));
                        nlapiLogExecution('DEBUG','Renewal','Value:'+ Math.round(rep_last_acv));

                        //set the Upsell if any based on the last year ACV to current year
                        if (parseInt(ACVModel.getFieldValue('custrecord_macv_upsell_id'+i)) > parseInt(0)) {

                            rep_current_acv = parseInt(ACVModel.getFieldValue('custrecord_macv_upsell_id'+i));
                            acv_per_year_rep_upsell = parseInt(Math.abs((parseInt(rep_current_acv) * parseInt(acv_per_rep)) / 100));
                            nlapiLogExecution('DEBUG','Upsell','Value:'+ Math.round(acv_per_year_rep_upsell));
                            acv_rec.setFieldValue('custrecord_acv_upsell', parseInt( Math.round(acv_per_year_rep_upsell)));
                        }
                        //set Contractual upsell if any based on the last year ACV to current year
                        if (parseInt(ACVModel.getFieldValue('custrecord_macv_cont_upsell_id'+i)) > parseInt(0)) {
                            rep_current_acv = parseInt(ACVModel.getFieldValue('custrecord_macv_cont_upsell_id'+i));
                            acv_per_year_rep_contract_upsell = parseInt(Math.abs((parseInt(rep_current_acv) * parseInt(acv_per_rep)) / 100));
                            acv_rec.setFieldValue('custrecord_acv_cont_upsell', parseInt( Math.round(acv_per_year_rep_contract_upsell)));
                            nlapiLogExecution('DEBUG','Contract Upsell','Value:'+ Math.round(acv_per_year_rep_contract_upsell));
                        }

                        //set Cancellation if any based on the last year ACV
                        if (parseInt(ACVModel.getFieldValue('custrecord_macv_cancel_id'+i)) > parseInt(0)) {
                            rep_current_acv = parseInt(ACVModel.getFieldValue('custrecord_macv_cancel_id'+i));
                            acv_per_year_rep_cancellation = parseInt(Math.abs((parseInt(rep_current_acv) * parseInt(acv_per_rep)) / 100));
                            acv_rec.setFieldValue('custrecord_acv_cancellation', parseInt( Math.round(acv_per_year_rep_cancellation)));
                            nlapiLogExecution('DEBUG','Cancellation','Value:'+ Math.round(acv_per_year_rep_cancellation));
                        }

                        //set Shrinkage if any based on the last year ACV
                        if (parseInt(ACVModel.getFieldValue('custrecord_macv_shrinkage_id'+i)) > parseInt(0)) {
                            rep_current_acv = parseInt(ACVModel.getFieldValue('custrecord_macv_shrinkage_id'+i));
                            acv_per_year_rep_shrinkage = parseInt(Math.abs((parseInt(rep_current_acv) * parseInt(acv_per_rep)) / 100));
                            acv_rec.setFieldValue('custrecord_acv_shrinkage', parseInt( Math.round(acv_per_year_rep_shrinkage)));
                            nlapiLogExecution('DEBUG','Shrinkage','Value:'+ Math.round(acv_per_year_rep_shrinkage));
                        }

                        acv_per_year_rep_breakdown = parseInt(ACVModel.getFieldValue('custrecord_macv_new_id'+i)) + parseInt(acv_per_year_rep_renewal) + parseInt(acv_per_year_rep_upsell) + parseInt(acv_per_year_rep_contract_upsell) - parseInt(acv_per_year_rep_cancellation) - parseInt(acv_per_year_rep_shrinkage);
                        acv_rec.setFieldValue('custrecord_acv_total_acv', parseInt( Math.round(acv_per_year_rep_breakdown)));
                        nlapiLogExecution('DEBUG','Total ACV','Value:'+parseInt( Math.round(acv_per_year_rep_breakdown)));


                    }
                    try {
                        //committing the ACV record to the database
                        var acvid = nlapiSubmitRecord(acv_rec, true);
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