Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items: [
        {
            xtype: 'container',
            itemId: 'gridContainer',
            columnWidth: 1
        }
    ],

    _userStore: null,

    launch: function() {
        // console.log('launch');

        var me = this;

        this.setLoading("Querying Subscription Users...");

        me._userStore = Ext.create('Rally.data.wsapi.Store', {
            model: 'User',
            autoLoad: true,
            limit: Infinity,
            filters: [
                {
                    property: 'UserName',
                    operator: 'contains',
                    value: '@'
                },
                {
                    property: 'Disabled',
                    operator: '=',
                    value: false
                }
            ],
            fetch: ['UserName','DisplayName'],
            listeners: {
                load: me._onDataLoaded,
                scope: me
            },
            sorters: [
                {
                    property: 'UserName',
                    direction: 'ASC'
                }
            ]
        });
    },

    _onDataLoaded: function(store, data) {

        // console.log('_onDataLoaded');

        var userRecords = [];

        _.each(data, function(record) {
            var displayName = record.get('DisplayName') || 'N/A';
            userRecords.push({
                'UserName': record.get('UserName'),
                'ObjectID': record.get('ObjectID'),
                'DisplayName': displayName
            });
        });

        this.setLoading(false);

        var userDetailTemplate = "<a href='https://rally1.rallydev.com/#/detail/user/{0}' target='_blank'>User Details</a>";


        this.down('#gridContainer').add({
            xtype: 'rallygrid',
            showRowActionsColumn: false,
            showPagingToolbar: true,
            editable: false,
            store: Ext.create('Rally.data.custom.Store', {
                data: userRecords
            }),
            pageSize: 25,
            columnCfgs: [
                {
                    text: 'Name',
                    dataIndex: 'UserName',
                    flex: 1
                },
                {
                    text: 'Display Name',
                    dataIndex: 'DisplayName',
                    renderer: function(value) {
                        if (value) {
                            return value;
                        }
                    }
                },
                {
                    text: 'User Details',
                    dataIndex: 'ObjectID',
                    renderer: function(value) {
                        return Ext.String.format(userDetailTemplate, value);
                    }
                }
            ]
        });
    }
});
