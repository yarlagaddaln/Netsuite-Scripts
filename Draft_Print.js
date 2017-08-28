function testprint(type){

     var suiteletURL = 'https://system.sandbox.netsuite.com'+nlapiResolveURL('SUITELET', 'customscriptestimate_draft_print', 'customdeploy1')+'&custparam_recid='+nlapiGetRecordId(); //scriptid and deploymentid will depend on the Suitelet that will be created below

    window.open(suiteletURL);

}