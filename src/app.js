
var HelloWorldLayer = cc.LayerColor.extend({
    m_tableView: null,
    ctor:function () {
        this._super(cc.color(200, 200, 200));

        this.showTableView();
    },

    showTableView: function () {
        if (!this.m_tableView) {
            var size = cc.winSize;

            this.m_tableView = cc.MultiColTableView.create(this, cc.size(300, 300)); //arg1:数据源，arg2:TableView尺寸(可见区域)
            //this.m_tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL); //视图滚动方向（默认值）
            //this.m_tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN); //排序方式
            this.m_tableView.setDelegate(this); //设置代理
            this.m_tableView.x = (size.width - this.m_tableView.width) / 2;
            this.m_tableView.y = (size.height - this.m_tableView.height) / 2;
            this.addChild(this.m_tableView);
        }
        this.m_tableView.reloadData(); //重新加载数据从数据源
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(100, 100);
    },

    tableCellAtIndex: function (table, idx) {
        var strValue = idx.toFixed(0);
        var cell = table.dequeueCell();
        var title;
        if (!cell) {
            cell = new cc.TableViewCell();

            var itemLayer = new cc.LayerColor(cc.color(255, 0, 0));
            itemLayer.setContentSize(90, 90);
            itemLayer.anchorX = 0;
            itemLayer.anchorY = 0;
            itemLayer.x = 0;
            itemLayer.y = 0;
            cell.addChild(itemLayer);

            title = new cc.LabelTTF(strValue, "", 20.0);
            title.x = 45;
            title.y = 45;
            title.setName('title');
            cell.addChild(title);
        } else {
            title = cell.getChildByName('title');
            title.setString(strValue);
        }
        cell.setName('cell' + strValue);

        return cell;
    },

    tableCellTouched: function (table, cell) {
        var id = cell.getIdx();
        cc.log('tableCellTouched', id);
    },

    //行数
    numberOfCellsRowInTableView: function (table) {
        return 4;
    },

    //列数
    numberOfCellsColumnInTableView: function (table) {
        return 3;
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

