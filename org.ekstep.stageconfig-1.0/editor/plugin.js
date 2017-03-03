EkstepEditor.basePlugin.extend({
    type: "org.ekstep.stageconfig",
    /**
     * Object to store stage audios. DataStructe {"<stage-id>": []} where array contains all audio objects in the stage
     * Array Object Structure = { stageId: String, type: 'audio', title: String, id: String, url: String}
     * @type {Object}
     */
    stageAudios: {},
    scope: EkstepEditorAPI.getAngularScope(),
    initialize: function() {
        EkstepEditorAPI.addEventListener(this.manifest.id + ":addcomponent", this.register, this);
        EkstepEditorAPI.addEventListener("stage:render:complete", this.stageRender, this);
        EkstepEditorAPI.addEventListener(this.manifest.id + ":remove", this.removeAudio, this);
    },
    register: function(event, data) {
        if (!this.stageAudios[data.stageId]) this.stageAudios[data.stageId] = [];
        this.stageAudios[data.stageId].push(data);
        this.showComponents(data.stageId);
    },
    getStageIndex: function(data) {
        return EkstepEditorAPI._.findIndex(this.stageConfig, function(stage) {
            return data.stageId === stage.stageId;
        });
    },
    addComponents: function(stageId) {
        var instance = this;
        if (!this.stageAudios[stageId]) this.stageAudios[stageId] = [];
        var audios = EkstepEditorAPI.getStagePluginInstances(stageId, ["org.ekstep.audio"]);
        _.each(audios, function(audio) {
            instance.stageAudios[stageId].push(audio.audioData);
        })
    },
    stageRender: function(event, data) {
        this.showComponents(data.stageId);
    },
    showComponents: function(stageId) {
        if (!this.stageAudios[stageId]) this.addComponents(stageId);
        var instance = this;
        this.hideStageComponents(stageId);
        setTimeout(function() {
                instance.showStageComponents(stageId);
            }, 500)
            //FIXME: Find a proper place to update currentStage
            //Good comment
        var instance = this;
        EkstepEditorAPI.ngSafeApply(instance.scope, function() {
            instance.scope.currentStage = EkstepEditorAPI.getCurrentStage();
        });
    },
    showStageComponents: function(stageId) {
        var instance = this;
        var items = [],
            assetArr = [];
        var events = EkstepEditorAPI.getStage(stageId).event;
        EkstepEditorAPI._.forEach(events, function(event) {
            if (event.type === 'enter') {
                if (EkstepEditorAPI._.isArray(event.action)) {
                    assetArr.push(event.action[0].asset);
                } else {
                    assetArr.push(event.action.asset);
                }
            }
        });
        EkstepEditorAPI._.forEach(this.stageAudios[stageId], function(component) {
            if (EkstepEditorAPI._.indexOf(assetArr, component.id) != -1) {
                component.autoplay = true;
            } else {
                component.autoplay = false;
            }
            items.push(component);
        });
        EkstepEditorAPI.ngSafeApply(instance.scope, function() {
            instance.scope.stageAttachments['audio'] = {};
            instance.scope.stageAttachments['audio'].items = items;
            instance.scope.stageAttachments['audio'].show = true;
        });
    },
    hideStageComponents: function(stageId) {
        var instance = this;
        EkstepEditorAPI.ngSafeApply(instance.scope, function() {
            instance.scope.stageAttachments['audio'] = {};
            instance.scope.stageAttachments['audio'].items = [];
            instance.scope.stageAttachments['audio'].show = false;
        });
    },
    removeAudio: function(event, data) {
        var instance = this;
        this.stageAudios[data.stageId] = EkstepEditorAPI._.reject(this.stageAudios[data.stageId], { id: data.id });
        this.showComponents(data.stageId);
    }
});
//# sourceURL=stageconfig.js
