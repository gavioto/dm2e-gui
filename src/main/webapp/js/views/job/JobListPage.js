define([
        'jquery',
        'underscore',
        'logging',
        'vm',
        'BaseView',
        'constants/RDFNS',
        'util/dialogs',
        'singletons/UserSession',
        'views/job/JobListTableRowView',
        'text!templates/job/jobListPageTemplate.html'
], function($, _, logging, Vm, BaseView, NS, dialogs, session, ItemView, theTemplate) {

    var log = logging.getLogger("views.job.JobListPage");

    return BaseView.extend({

        template: theTemplate,

        itemView: ItemView,

        listSelector : "tbody",

        initialize : function() {
            this.listenTo(this.collection, "sync", this.render);
            this.collection.fetch();
        },

        render : function() {
            this.renderModel();
            this.renderCollection();
            return this;
        },

    });
});
