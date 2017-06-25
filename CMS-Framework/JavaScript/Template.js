/**
 * Function - class, used to deal with templates.
 *
 * @param $templatePath
 * @param $placeholderName
 * @param $templateData
 *
 * @constructor
 */

function Template($templatePath, $placeholderName, $templateData){

    // Make sure that the template data comes as an object.
    if(!DevelopmentHelpers.isObject($templateData)){

        console.error('Template.constructor(): The template data should be an object!');
        return;
    }

    // Initial private attributes.
    const _templatePath = $templatePath;
    const _placeholderName = $placeholderName;

    // Can be (afterwards) modified.
    let _templateData = $templateData;

    // Will be populated later.
    let _placeholder = {};
    let _template = {};

    // Used to add (afterwards) data to a template.
    const addAfterTemplateData = function ($data) {

        if(!DevelopmentHelpers.isObject($data)){

            console.error('Template: The template data should be an object!');
            return;
        }

        _templateData = $data;
    };

    // Tries to fetch the placeholder from the host page.
    const getPlaceholder = function () {

        _placeholder = $(_placeholderName);
        if(!_placeholder){

            console.error(`Template: ${_placeholderName} has not been found on DOM.`);
            return false;
        }

        return true;
    };

    // Tries to fetch the template from the module-html file.
    const getTemplate = function ($proceedGeneration) {

        new Request({
            url: _templatePath,
            method: 'get',
            onSuccess($template){

                _template = $template;

                if($proceedGeneration){

                    generateTemplate();
                }
            },
            onFailure($xhr){

                console.error(`Template: ${_templatePath} has not been fetched.`);
                console.error($xhr);
            }
        }).send();
    };

    // Tries to generate the template on the host page with the template data.
    const generateTemplate = function () {

        const $compiled = Handlebars.compile(_template);
        _placeholder.set('html', $compiled(_templateData));
    };

    /**
     * @public
     *
     * Kicks-in the straight-forward process.
     *
     * @return void
     */

    this.displayMain = function () {

        if(getPlaceholder()){

            // Proceed to generation (straight - forward).
            getTemplate(true);
        }
    };

    /**
     * @public
     *
     * Makes the placeholder visible.
     *
     * @return void
     */

    this.makeVisible = function () {

        _placeholder.style.display = 'block';
    };

    /**
     * @public
     *
     * Makes the placeholder invisible.
     *
     * @return void
     */

    this.makeInvisible = function () {

        _placeholder.style.display = 'none';
    };

    /**
     * @public
     *
     * Prepares the template without generating.
     *
     * @return void
     */

    this.prepare = function () {

        if(getPlaceholder()){

            // No generation.
            getTemplate(false);
        }
    };

    /**
     * @public
     *
     * Calls for displaying the template with additional data.
     *
     * @param $data
     *
     * @return void
     */

    this.displayAfter = function ($data) {

        addAfterTemplateData($data);
        generateTemplate();
    }
}