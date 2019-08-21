function jsonEdit(json, container) {


    const options = {};
    const editor = new JSONEditor(container, options);

    editor.set(json);

    // get json
    //var json = editor.get();
    //console.log(editor);
}
