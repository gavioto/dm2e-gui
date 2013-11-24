define([
    'jquery',
    'underscore',
    'BaseView',
    'logging',
    'sorttable',
    'vm',
    'singletons/UserSession',
    'constants/RDFNS',
    'util/UriUtils',
    'text!templates/filter/QueryFilterTemplate.html',
], function($,
    _,
    BaseView,
    logging,
    sorttable,
    Vm,
    session,
    RDFNS,
    UriUtils,
    queryFilterTemplate) {

    var log = logging.getLogger("views.filter.QueryFilterTemplate");

    return BaseView.extend({

        template : queryFilterTemplate,

        initialize : function(options) {

            /*
             * parentView must provide 
             * - a fetchCollection method!
             * - a queryParams dict
             *
             */
            this.parentView = options.parentView;

            /*
             * facets is a list of objects with keys
             * - queryParam
             * - label
             * - rdfProp
             */
            this.facets = options.facets;

            /*
             * sortOpts ..
             *
             */
            this.sortOpts = options.sortOpts;

            this.$el = options.$el;

            // this.render();
            // this.applyFilters();
        },

        applyFilters : function() { 
            var that = this;

            // apply filters
            this.$("select[data-filter-prop]").each(function(idx, sel) {
                console.log("select " + idx);
                console.log($(sel).val());
                if ($(sel).val() === 'none') {
                    delete that.parentView.queryParams[$(sel).attr("data-filter-query-param")];
                } else {
                    that.parentView.queryParams[$(sel).attr("data-filter-query-param")] = $(sel).val(); 
                }
            });

            // apply sort
            var sortOpt = this.$("select.sort-select option:selected");
            this.parentView.queryParams.sort = sortOpt.val();
            this.parentView.queryParams.order = sortOpt.attr("data-sort-order");
            console.error(that.parentView.queryParams);
            this.parentView.fetchCollection();
        },

        events: {
            "click button[name=filters-apply]" : function() { this.applyFilters(); },
            "click button[name=filters-reset]" : function() { 
                this.$("select[data-filter-prop]").each(function(idx, sel) {
                    $(sel).val('none');
                });
                this.applyFilters();
            }
        },

        render: function() {
            var that = this;
            this.renderModel();

            /**
             * Add Filter options
             */
            _.each(this.facets, function(facetObj) {
                var span = $("<span>")
                             .append(facetObj.label)
                             .append("&nbsp;:&nbsp;")
                             .append($("<select>")
                                       .attr("data-filter-prop", facetObj.rdfProp)
                                       .attr("data-filter-query-param", facetObj.queryParam)
                                       .append($("<option>")
                                                 .val("none")
                                                 .append("&mdash;"))
                                       .append("&nbsp;"))
                             .prependTo(that.$el);
            });

            /**
             * Add sort options
             */
            _.each(this.sortOpts, function(rdfProp, key) {
                _.each(["asc","desc"], function(order) {
                    that.$("select.sort-select")
                           .append($("<option>")
                                     .attr("data-sort-order", order)
                                     .val(rdfProp)
                                     .append(key + " / "  + order));
                });
            });
            // set currently set sort option
            if (this.parentView.queryParams.sort) {
                var order = this.parentView.queryParams.order;
                if (! order) {
                    order = 'asc';
                }
                this.$("select.sort-select option[data-sort-order=" + order + "][value='" + this.parentView.queryParams.sort + "']")
                    .attr('selected', 'selected');
            }

            /*
             * Load facets
             *
             */
            $.ajax({
                url : that.parentView.collection.url() + '/facets',
                success : function(facetMapList) {
                    _.each(facetMapList, function(facetMap){
                        _.each(facetMap.values, function(val) {
                            that.$("select[data-filter-prop='" + facetMap.rdfProp + "']")
                                .append($("<option>")
                                    .val(val)
                                    .append(UriUtils.last_url_segment(val)));
                        });
                        if (that.parentView.queryParams[facetMap.queryParam]) {
                            that.$("select[data-filter-prop='" + facetMap.rdfProp  + "']").val(that.parentView.queryParams[facetMap.queryParam]);
                        }
                    });
                }
            });

            // IMPORTANT to return this (otherwise breaks render hierarchy
            return this;
        },
    });
});
