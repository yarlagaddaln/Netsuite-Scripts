function BeforeLoad_SO(type) {
  if(type=='create'){
	  try{
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
		
		//read the url parameters and get salesorder id
		var query = window.location.search.substring(1);
		var vars = query.split("&");
		for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
		if(pair[0]=='so_id'){
			so_id = pair[1];
		}
		}
		//load the SO record to retrive the details..
        var salesorder_info = nlapiLoadRecord('salesorder', so_id);
		//setting up the Primary populate fields..

        //get the sales order number
		nlapiSetFieldValue('custrecord_macv_sales_order_num', so_id);
		// get the estimate number
        var estimate_no = salesorder_info.getFieldValue('createdfrom');
		nlapiSetFieldValue('custrecord_macv_estimate', salesorder_info.getFieldValue('createdfrom'));
		// get the customer name
		 nlapiSetFieldValue('custrecord_macv_customer', salesorder_info.getFieldValue('entity'));
		 //get the start date of deal
		  nlapiSetFieldValue('custrecord_macv_start_date', salesorder_info.getFieldValue('startdate'));
		 //get the end date of deal
		 nlapiSetFieldValue('custrecord_macv_end_date', salesorder_info.getFieldValue('enddate'));
		 //get the deal opt out date
		 nlapiSetFieldValue('custrecord_macv_optout', salesorder_info.getFieldValue('custbody21'));
		 //get partner name
		 nlapiSetFieldValue('custrecord_macv_partner', salesorder_info.getFieldValue('partner'));
		//Loading Estimate to get product category
		/* if(estimate_no){
		var estimate_info = nlapiLoadRecord('estimate', estimate_no);
        var product_category = estimate_info.getFieldValue('custbody22');
		} */
		//nlapiSetFieldValue('custrecord_macv_prod_catergory', product_category);
		
		//code change to get product category from sales order
		/* var prdct_cat = salesorder_info.getFieldValues('custbody22');
		nlapiSetFieldValues('custrecord_macv_prod_catergory', [].concat(prdct_cat)); */
		
		
		 //setting the total SO amount after discount
        nlapiSetFieldValue('custrecord_macv_total_so_amount', salesorder_info.getFieldValue('subtotal'));

        //getting the total items
        var total_item_count = parseInt(salesorder_info.getLineItemCount('item'));
		
		//getting sales reps
        var total_reps = salesorder_info.getLineItemCount('salesteam');
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
            var rep_region = salesrep_info.getFieldValue('custentity_salesrep_region');
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
		Date.prototype.addDays = function(days) {
					this.setDate(this.getDate() + parseInt(days));
					return this;
				};

		
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
               
				if(k==1){
					nlapiSetFieldValue('custrecord_macv_start_date_id' + k, deal_start);
					var currentDate = new Date(deal_start);
					// to add 4 days to current date
					currentDate.addDays(365);
					//alert(currentDate);
					var d_year = currentDate.getFullYear();
					var d_month = currentDate.getMonth()+1;
					var d_date =  currentDate.getDate()-1;
					if(d_date == 0){
					var d = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
					//alert(d);
					d_date =d.getDate(); // last day in month
					d_month = d.getMonth()+1;
					//alert(d.getMonth());
					}
					var end_date = d_month+'/'+d_date+'/'+d_year;
					nlapiSetFieldValue('custrecord_macv_end_date_id' + k,end_date);
				}
				else{
					//get last year end date for this year start date
					var last_end_date = new Date(nlapiGetFieldValue('custrecord_macv_end_date_id'+(k-1)));
					last_end_date.addDays(364);
					//generating start dates
					var s_year_start = new Date(nlapiGetFieldValue('custrecord_macv_end_date_id'+(k-1)));
					var s_year =  s_year_start.getFullYear();
					var s_month = s_year_start.getMonth()+1;
					var s_date = s_year_start.getDate()+1;
					var s_full_date = s_month+'/'+s_date+'/'+s_year;
					
					d_year = last_end_date.getFullYear();
					d_month = last_end_date.getMonth()+1;
					d_date = s_date-1;

					end_date = d_month+'/'+d_date+'/'+d_year;
					
					nlapiSetFieldValue('custrecord_macv_start_date_id' + k,s_full_date);
					
					var org_deal_end = new Date(deal_end);
					var org_deal_end_day = org_deal_end.getDate();
					var org_deal_end_month = org_deal_end.getMonth();
					var org_deal_end_year = org_deal_end.getFullYear();
					
					if((k==deal_no_of_years)){
						if((d_date > org_deal_end_day)||(d_month > org_deal_end_month)||(d_year > org_deal_end_year)){
							nlapiSetFieldValue('custrecord_macv_end_date_id' + k,deal_end);
						}
						
					}
					else{
						nlapiSetFieldValue('custrecord_macv_end_date_id' + k,end_date);
					}
					
					nlapiLogExecution('DEBUG', 'Start date for ' + k + ' year', 'start date = ' + s_full_date);
					nlapiLogExecution('DEBUG', 'End date for ' + k + ' year', 'End date = ' + end_date);
				}
				
               
            }
        }
		 var y = 1;
        for (j = 1; j <= total_item_count; j++) {
			var type_of_item = salesorder_info.getLineItemValue('item', 'item', j);
			var discount_items = [516,507,580,69,506,515,512,513,517,514,580,579,-6];
            //get only the discounts
            if (discount_items.indexOf(type_of_item)!=-1) {
                //nlapiLogExecution('DEBUG', 'Discount', 'count= ' + salesorder_info.getLineItemValue('item', 'amount', j));
                discount_total = parseInt(discount_total + Math.abs(salesorder_info.getLineItemValue('item', 'amount', j)));
                nlapiSetFieldValue('custrecord_macv_discount_id' + y, Math.abs(salesorder_info.getLineItemValue('item', 'amount', j)));
            }
			
            //get only the subtotals i.e ACV per year
            else if (type_of_item == -2) {
                if (y == 1) {
                    acv_year1 = Number(salesorder_info.getLineItemValue('item', 'amount', j));
                    nlapiSetFieldValue('custrecord_macv_new_id'+ y, acv_year1);
                    acv_total_year = parseInt(nlapiGetFieldValue('custrecord_macv_new_id'+y)) + parseInt(nlapiGetFieldValue('custrecord_macv_renewal_id'+y)) + parseInt(nlapiGetFieldValue('custrecord_macv_upsell_id'+y)) + parseInt(nlapiGetFieldValue('custrecord_macv_cont_upsell_id'+y)) - parseInt(nlapiGetFieldValue('custrecord_macv_cancel_id'+y)) - parseInt(nlapiGetFieldValue('custrecord_macv_shrinkage_id'+y));
                    nlapiSetFieldValue('custrecord_macv_total_acv_id' + y, Math.abs(acv_total_year));

                }
                if (y == 2) {
                    acv_year2 = Number(salesorder_info.getLineItemValue('item', 'amount', j));
					 nlapiSetFieldValue('custrecord_macv_renewal_id'+y, acv_year2);
                    acv_total_year = parseInt(nlapiGetFieldValue('custrecord_macv_new_id'+y)) + parseInt(nlapiGetFieldValue('custrecord_macv_renewal_id'+y)) + parseInt(nlapiGetFieldValue('custrecord_macv_upsell_id'+y)) + parseInt(nlapiGetFieldValue('custrecord_macv_cont_upsell_id'+y)) - parseInt(nlapiGetFieldValue('custrecord_macv_cancel_id'+y)) - parseInt(nlapiGetFieldValue('custrecord_macv_shrinkage_id'+y));
                    nlapiSetFieldValue('custrecord_macv_total_acv_id' + y, Math.abs(acv_total_year));
                }
                if (y == 3) {
                    acv_year3 = Number(salesorder_info.getLineItemValue('item', 'amount', j));
					 nlapiSetFieldValue('custrecord_macv_renewal_id' + y, acv_year3);

                    acv_total_year = parseInt(nlapiGetFieldValue('custrecord_macv_new_id'+y)) + parseInt(nlapiGetFieldValue('custrecord_macv_renewal_id'+y)) + parseInt(nlapiGetFieldValue('custrecord_macv_upsell_id'+y)) + parseInt(nlapiGetFieldValue('custrecord_macv_cont_upsell_id'+y)) - parseInt(nlapiGetFieldValue('custrecord_macv_cancel_id'+y)) - parseInt(nlapiGetFieldValue('custrecord_macv_shrinkage_id'+y));
                    nlapiSetFieldValue('custrecord_macv_total_acv_id'+y, Math.abs(acv_total_year));
                }
                if (y == 4) {
                    acv_year4 = Number(salesorder_info.getLineItemValue('item', 'amount', j));
					nlapiSetFieldValue('custrecord_macv_renewal_id' + y, acv_year4);
                    acv_total_year = parseInt(nlapiGetFieldValue('custrecord_macv_new_id'+y)) + parseInt(nlapiGetFieldValue('custrecord_macv_renewal_id'+y)) + parseInt(nlapiGetFieldValue('custrecord_macv_upsell_id'+y)) + parseInt(nlapiGetFieldValue('custrecord_macv_cont_upsell_id'+y)) - parseInt(nlapiGetFieldValue('custrecord_macv_cancel_id'+y)) - parseInt(nlapiGetFieldValue('custrecord_macv_shrinkage_id'+y));

                    nlapiSetFieldValue('custrecord_macv_total_acv_id'+y, Math.abs(acv_total_year));
                }
						
                y++;
            }
		
		else{
			//alert('here');
		}
        }

        nlapiSetFieldValue('custrecord_macv_so_discount', discount_total);
		if(parseInt(total_reps)==0){
			total_reps=1;
		}
        nlapiSetFieldValue('custrecord_no_of_reps', total_reps);
        nlapiSetFieldValue('custrecord_no_of_years', deal_no_of_years);
		
        

	  }
	  catch(e){
	if ( e instanceof nlobjError )
	nlapiLogExecution('DEBUG','Error','Details: ' + e.getDetails() + ' Code: ' + e.getCode());
	else
	nlapiLogExecution('DEBUG','Error','Error Details: ' + e.toString());
      
		  }
        
   
    } 

}