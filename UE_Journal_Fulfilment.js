/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
const JE_DEBIT = 417;
const JE_CREDIT = 43;

define(['N/record', 'N/search'],
    function(record, search) {
        function Create_JE_Fulfilment(context) {

            var FulfilmentRecord = context.newRecord;

            //get the sales order id
            // Get the Sales Rep record ID
            var salesorder_id = FulfilmentRecord.getValue({
                "fieldId": "createdfrom"
            });

            log.debug('Sales order ', 'Id: ' + salesorder_id);
            //look up for the sales order ammount for posting

            var fieldLookUp = search.lookupFields({
                type: search.Type.SALES_ORDER,
                id: salesorder_id,
                columns: ['total', 'custbody_so_journal_entry','entity']
            });

            var so_required_values = JSON.stringify(fieldLookUp);
            so_required_values = JSON.parse(so_required_values);
            log.debug('Journal entry', 'value: ' + so_required_values.custbody_so_journal_entry[0].value);
            log.debug('Sales order total ', 'total: ' + so_required_values.total);
            //log.debug('Sales order total ', 'total: ' + so_required_values.custbody_so_journal_entry[0].value);

            if (!so_required_values.custbody_so_journal_entry[0].value) {
                var journalentry_create = record.create({
                    type: record.Type.JOURNAL_ENTRY,
                    isDynamic: true
                });

                journalentry_create.setValue('subsidiary', 1);
                journalentry_create.setValue('currency', 1);
				//journalentry_create.setValue('customform', 151);
				journalentry_create.setValue('memo', 'Sales Order#'+salesorder_id +'-'+so_required_values.entity[0].text);
				journalentry_create.setValue('custbody_salesorder_no', salesorder_id);
				
				
				

                // debit line
                journalentry_create.selectNewLine({
                    sublistId: 'line'
                });
                journalentry_create.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    value: JE_DEBIT,
                    ignoreFieldChange: true
                });
                journalentry_create.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'debit',
                    value: so_required_values.total,
                    ignoreFieldChange: true
                });
                //journalentry_create.setCurrentSublistValue('line', 'account', JE_DEBIT);
                //journalentry_create.setCurrentSublistValue('line', 'debit', fieldLookUp.total);

                journalentry_create.commitLine({
                    sublistId: 'line'
                });
                //journalentry_create.commitLine('line');
                // credit line
                journalentry_create.selectNewLine({
                    sublistId: 'line'
                });
                journalentry_create.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    value: JE_CREDIT,
                    ignoreFieldChange: true
                });
                journalentry_create.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    value: so_required_values.total,
                    ignoreFieldChange: true
                });

                //journalentry_create.setCurrentSublistValue('line', 'account', JE_CREDIT);
                //journalentry_create.setCurrentSublistValue('line', 'credit', fieldLookUp.total);
                journalentry_create.commitLine({
                    sublistId: 'line'
                });

                try {
                    var jeId = journalentry_create.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                    //var jeId = journalentry_create.save();
                    log.debug('journalentry  record created successfully', 'Id: ' + jeId);

                    // post the je back to the sales order
                    var so_id = record.submitFields({
                        type: record.Type.SALES_ORDER,
                        id: salesorder_id,
                        values: {
                            custbody_so_journal_entry: jeId
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                } catch (e) {
                    log.error(e.name);
                }
            }
        }
        return {
            afterSubmit: Create_JE_Fulfilment
        };
    });