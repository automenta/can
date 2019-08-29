function jsonEdit(json, container) {


    //https://github.com/josdejong/jsoneditor/blob/master/docs/api.md#configuration-options
    const options = {
        //mode: 'view',
        search: false,
        mainMenuBar: false,
        navigationBar: false,
        statusBar: false
    };
    const editor = new JSONEditor(container, options);

    editor.set(json);

    return editor;
}

function textedit(container) {
    const options = {
        //mode: 'code',
        mode: 'text',
        search: false,
        mainMenuBar: false,
        navigationBar: false,
        statusBar: false
    };
    return new JSONEditor(container, options);
}