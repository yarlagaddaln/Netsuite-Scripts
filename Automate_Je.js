/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 */
var SAVED_SEARCH_ID = 'customsearch2129';
define(['N/search', 'N/record', 'N/runtime', 'N/error'],
    function(search, record, runtime, error)
    {
        function getInputData(){
            log.debug('In Get Input data Stage');
            var mySearch = search.load({
                id: SAVED_SEARCH_ID
            });
            return mySearch;
        }

        function map(context)
        {
            log.debug('In Map Stage');
        }
		  function reduce(context)
        {
			log.debug('In Reduce Stage');
		}
		
		   function summarize(summary)
        {
			log.debug('In Summarize Stage');
        }
        return {
            getInputData: getInputData,
            map: map,
			reduce: reduce,
            summarize: summarize
        };
    });