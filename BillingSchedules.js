/****
User vent script that creates custom billing schedules based on billing schedule type selected by the user...

 ****/

//customrecord_sales_order_billing_schedul
/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
const RECORD_TYPE = 'customrecord_sales_order_billing_schedul';
define(['N/record'],
	function (record) {
	/*
	function doSomething1(context){
	if (context.type !== context.UserEventType.CREATE)
	return;
	var customerRecord = context.newRecord;
	customerRecord.setValue('phone', '555-555-5555');
	if (!customerRecord.getValue('salesrep'))
	customerRecord.setValue('salesrep', 46);
	}
	function doSomething2(context){
	if (context.type !== context.UserEventTypes.CREATE)
	return;
	var customerRecord = context.newRecord;
	customerRecord.setValue('comments', 'Please follow up with this customer!');
	} */
	function Create_Billing_Schedules(context) {
		var customerRecord = context.newRecord;
		var quarter_dates = new Array();
		var schedule_name = customerRecord.getValue('name');
		var schedule_start_date = customerRecord.getValue('custrecord_billing_date');
		var schedule_description = customerRecord.getValue('custrecord_billing_description');
		var schedule_billing_amount = customerRecord.getValue('custrecord_total_amount');
		var scheudle_linked_so = customerRecord.getValue('custrecord_linked_so');
		var schedule_frequency = customerRecord.getValue('custrecord_recurrence_frequency');
		var schedule_reccurence_count = customerRecord.getValue('custrecord_recurrence_count');
		var schedule_payment_terms = customerRecord.getValue('custrecord_recurrence_payment_terms');
		var linked_schedules = new Array();

		if (context.type == context.UserEventType.CREATE) {

			if (schedule_frequency == 4) {
				log.debug('DEBUG', 'in edit' + RECORD_TYPE);
				//monthly
				//create schedules based on count
				for (i = 0; i < schedule_reccurence_count; i++) {

					if (i == 0) {
						//consider billing schedule start date as the default start date..
						var schedule_start = new Date(schedule_start_date);
						schedule_start = schedule_start.getMonth() + 1 + '/' + schedule_start.getDate() + '/' + schedule_start.getFullYear();
						quarter_dates[i] = schedule_start;
						//log.debug('DEBUG', 'in first date' + quarter_dates[i]);
					} else {
						//log.debug('DEBUG', 'in next date' + quarter_dates[i-1]);
						var last_date = quarter_dates[i - 1];
						//log.debug('DEBUG', 'in last date' + last_date);
						var d = new Date(last_date);
						var next_schdule = d.setMonth(d.getMonth() + 1);
						next_schdule = new Date(next_schdule);
						//next_schdule.getFullYear();
						//next_schdule.getDay();
						//next_schdule.getMonth();
						next_schdule = next_schdule.getMonth() + 1 + '/' + next_schdule.getDate() + '/' + next_schdule.getFullYear();
						quarter_dates[i] = next_schdule;
						//log.debug('DEBUG', 'new generated date' + quarter_dates[i]);
					}
				}

				//loop throught the number of dates available in the array and create records

				for (j = 1; j < quarter_dates.length; j++) {
					log.debug('DEBUG', 'new generated date' + quarter_dates[j]);
					var billing_schedule = record.create({
							type: RECORD_TYPE,
							isDynamic: true
						});
					billing_schedule.setValue('name', schedule_name);
					billing_schedule.setValue('custrecord_recurrence_frequency', 4);
					billing_schedule.setValue('custrecord_billing_description', schedule_description);
					billing_schedule.setValue('custrecord_billing_amount', schedule_billing_amount/schedule_reccurence_count);
					billing_schedule.setValue('custrecord_billing_date', new Date(quarter_dates[j]));
					billing_schedule.setValue('custrecord_recurrence_count', 1);
					billing_schedule.setValue('custrecord_linked_so', scheudle_linked_so);

					try {
						var billing_schedule_Id = billing_schedule.save();
						log.debug('Call record created successfully', 'Id: ' + billing_schedule_Id);
						linked_schedules[j - 1] = billing_schedule_Id;
					} catch (e) {
						log.error(e.name);
					}
				}
				var current_record = context.newRecord.id;
				var id = record.submitFields({
						type: RECORD_TYPE,
						id: current_record,
						values: {
							custrecord_linked_billing_schedules: linked_schedules,
							custrecord_billing_amount : schedule_billing_amount/schedule_reccurence_count
						},
						options: {
							enableSourcing: false,
							ignoreMandatoryFields: true
						}
					});

				log.debug('Current Record', 'Id: ' + current_record);
				linked_schedules = '';
				quarter_dates = '';
			}

		}

		if (context.type == context.UserEventType.EDIT) {}
	}
	return {
		/*  beforeLoad: doSomething1,
		beforeSubmit: doSomething2, */
		afterSubmit: Create_Billing_Schedules
	};
});