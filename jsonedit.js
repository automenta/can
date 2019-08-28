function jsonEdit(json, container) {


    //https://github.com/josdejong/jsoneditor/blob/master/docs/api.md#configuration-options
    const options = {
        //mode: 'preview'
        mode: 'view',
        search: false,
        mainMenuBar: false,
        navigationBar: false,
        statusBar: false
    };
    const editor = new JSONEditor(container, options);

    editor.set(json);

}
