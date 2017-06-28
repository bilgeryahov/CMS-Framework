/**
 * Class used for creating instances of template
 * objects. Motivation for creating this solution
 * came from the fact that the static HTML files
 * get too clumsy with all the HTML contenct written
 * on the on beforehand.
 *
 * This class provides simple-to-complex functionality,
 * depending on the needs.
 *
 * Can be used to generate static templates with initial
 * data.
 *
 * Can be used to generate flexible templates, with data
 * being added later and (or) the template itself being
 * displayed or hidden.
 *
 * @param $templatePath
 * @param $placeholderName
 * @param $templateData
 *
 * @constructor
 */

function Template($templatePath, $placeholderName, $templateData){

    if(!DevelopmentHelpers.isObject($templateData)){

        console.error('Template.constructor(): The template data should be an object!');
        return;
    }

    const _templatePath = $templatePath;
    const _placeholderName = $placeholderName;
    let _templateData = $templateData;
    let _placeholder = {};
    let _template = {};

    const addAfterTemplateData = function ($data) {

        if(!DevelopmentHelpers.isObject($data)){

            console.error('Template: The template data should be an object!');
            return;
        }

        _templateData = $data;
    };

    const getPlaceholder = function () {

        _placeholder = $(_placeholderName);
        if(!_placeholder){

            console.error(`Template: ${_placeholderName} has not been found on DOM.`);
            return false;
        }

        return true;
    };

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

    const generateTemplate = function () {

        const $compiled = Handlebars.compile(_template);
        _placeholder.set('html', $compiled(_templateData));
    };

    /**
     * @public
     *
     * Straight-forward process of rendering
     * the template on the page.
     *
     * @return void
     */

    this.displayMain = function () {

        if(getPlaceholder()){

            getTemplate(true);
        }
    };

    /**
     * @public
     *
     * Makes the template placeholder visible.
     *
     * @return void
     */

    this.makeVisible = function () {

        _placeholder.style.display = 'block';
    };

    /**
     * @public
     *
     * Makes the template placeholder invisible.
     *
     * @return void
     */

    this.makeInvisible = function () {

        _placeholder.style.display = 'none';
    };

    /**
     * @public
     *
     * Makes sure that the module (template) is
     * loaded, but not rendered.
     *
     * @return void
     */

    this.prepare = function () {

        if(getPlaceholder()){

            getTemplate(false);
        }
    };

    /**
     * @public
     *
     * Renders the template afterwards, with additional
     * data (if needed).
     *
     * @param $data [object]
     *
     * @return void
     */

    this.displayAfter = function ($data) {

        if(!$data){

            $data = {};
        }

        addAfterTemplateData($data);
        generateTemplate();
    }
}