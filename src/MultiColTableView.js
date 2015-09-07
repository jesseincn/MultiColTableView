/**
 * cc.MultiColTableView 多行多列控件
 * Created by young on 15/8/31.
 * 使用方法:
   this.m_tableView = cc.MultiColTableView.create(this, cc.size(300, 300));
   this.addChild(this.m_tableView);
 *
 * 设置参数(设置参数后必须使用this.m_tableView.reloadData()重新加载数据):
 //this.m_tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL); //视图滚动方向（默认值）
 //this.m_tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN); //排序方式
   this.m_tableView.setDelegate(this);
 *
 * 重构以下方法:
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
            itemLayer.setContentSize(this.tableCellSizeForIndex());
            itemLayer.anchorX = 0;
            itemLayer.anchorY = 0;
            itemLayer.x = 0;
            itemLayer.y = 0;
            cell.addChild(itemLayer);

            title = new cc.LabelTTF(strValue, "", 20.0);
            title.x = 50;
            title.y = 50;
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
        return 3;
     },

     //列数
     numberOfCellsColumnInTableView: function (table) {
        return 3;
     }
 *
 * 重新加载数据从数据源
    this.m_tableView.reloadData();
 *
 */

/**
 * 默认触摸事件回调代理
 * @type {Object|Function|*|void}
 */
cc.MultiColTableViewDelegate = cc.TableViewDelegate.extend({
    tableCellTouchBegan: function (table, Cell, point) {

    },

    tableCellTouchMoved: function (table, Cell, point) {

    },

    tableCellTouchCancelled: function (table, Cell, point) {

    }
});

/**
 * 数据源
 */
cc.MultiColTableViewDataSource = cc.Class.extend({
    /**
     * 单元尺寸对于给定的索引
     * @param {cc.TableView} table table to hold the instances of Class
     * @param {Number} idx the index of a cell to get a size
     * @return {cc.Size} size of a cell at given index
     */
    tableCellSizeForIndex: function (table, idx) {
        return this.cellSizeForTable(table);
    },
    /**
     * 单元格高度给定表。
     * @param {cc.TableView} table table to hold the instances of Class
     * @return {cc.Size} cell size
     */
    cellSizeForTable: function (table) {
        return cc.size(0, 0);
    },
    /**
     * 给定索引处的单元实例
     * @param {cc.TableView} table table to hold the instances of Class
     * @param idx index to search for a cell
     * @return {cc.TableView} cell found at idx
     */
    tableCellAtIndex: function (table, idx) {
        return null;
    },
    /**
     * 行数
     */
    numberOfCellsRowInTableView: function (table) {
        return 0;
    },
    /**
     * 列数
     * @param table
     * @returns {number}
     */
    numberOfCellsColumnInTableView: function (table) {
        return 0;
    }
});

/**
 * 控件实现
 * @type {Object|Function|*|void}
 */
cc.MultiColTableView = cc.TableView.extend({
    /**
     * 更新所有Cell坐标
     * @private
     */
    _updateCellPositions: function () {
        var row = this._dataSource.numberOfCellsRowInTableView(this); //行数
        var column = this._dataSource.numberOfCellsColumnInTableView(this); //列数

        var cellsCount = row * column;

        if (cellsCount > 0) {
            var currentPos = cc.p(0, 0);
            var cellSize = this._dataSource.tableCellSizeForIndex(this);

            switch (this.getDirection()) {
                case cc.SCROLLVIEW_DIRECTION_HORIZONTAL:
                    for (var i = 0; i < column; i++) {
                        currentPos.x = cellSize.width * i;
                        for (var j = 0; j < row; j++) {
                            var index = i * row + j;
                            currentPos.y = cellSize.height * j;
                            this._cellsPositions[index] = cc.p(currentPos.x, currentPos.y);
                        }
                    }
                    break;
                default:
                    for (var i = 0; i < row; i++) {
                        currentPos.y = cellSize.height * i;
                        for (var j = 0; j < column; j++) {
                            var index = i * column + j;
                            currentPos.x = cellSize.width * j;
                            this._cellsPositions[index] = cc.p(currentPos.x, currentPos.y);
                        }
                    }
                    break;
            }
            this._cellsPositions[cellsCount] = cc.p(currentPos.x + cellSize.width, currentPos.y + cellSize.height);
        }
    },
    /**
     * 更新容器尺寸
     * @private
     */
    _updateContentSize: function () {
        var size = cc.size(0, 0);
        var column = this._dataSource.numberOfCellsColumnInTableView(this);
        var row = this._dataSource.numberOfCellsRowInTableView(this);
        var cellsCount = column * row;

        if (cellsCount > 0) {
            //var maxPosition = this._cellsPositions[cellsCount];
            switch (this.getDirection()) {
                case cc.SCROLLVIEW_DIRECTION_HORIZONTAL:
                    size = cc.size(this._cellsPositions[cellsCount].x, this._viewSize.height);
                    break;
                default:
                    size = cc.size(this._viewSize.width, this._cellsPositions[cellsCount].y);
                    break;
            }
        }

        this.setContentSize(size); //设置容器尺寸
        //设置容器偏移量并触发滚动函数this.scrollViewDidScroll()
        if (this._oldDirection != this._direction) {
            if (this._direction == cc.SCROLLVIEW_DIRECTION_HORIZONTAL) {
                this.setContentOffset(cc.p(this.minContainerOffset().x, 0));
            } else {
                this.setContentOffset(cc.p(0, this.minContainerOffset().y));
            }
            this._oldDirection = this._direction;
        }
    },
    /**
     * 滚动视图
     * @param view
     */
    scrollViewDidScroll: function (view) {
        var uCountOfItems = this._dataSource.numberOfCellsColumnInTableView(this) * this._dataSource.numberOfCellsRowInTableView(this);
        if (0 == uCountOfItems) {
            return;
        }

        if (this._tableViewDelegate !== null && this._tableViewDelegate.scrollViewDidScroll) {
            this._tableViewDelegate.scrollViewDidScroll(this);
        }

        //获取显示区域开始的格子id和结束的格子id
        var startIdx = 0, endIdx = 0, idx = 0, maxIdx = 0;
        var offset = cc.pMult(this.getContentOffset(), -1);
        maxIdx = Math.max(uCountOfItems - 1, 0);

        if (this._vOrdering === cc.TABLEVIEW_FILL_TOPDOWN) {
            offset.y = offset.y + this._viewSize.height / this.getContainer().getScaleY();
        }
        startIdx = this._indexFromOffset(offset);
        if (startIdx === cc.INVALID_INDEX) {
            startIdx = uCountOfItems - 1;
        }

        if (this._vOrdering === cc.TABLEVIEW_FILL_TOPDOWN) {
            offset.y -= this._viewSize.height / this.getContainer().getScaleY();
        } else {
            offset.y += this._viewSize.height / this.getContainer().getScaleY();
        }
        offset.x += this._viewSize.width / this.getContainer().getScaleX();

        endIdx = this._indexFromOffset(offset);
        if (endIdx === cc.INVALID_INDEX) {
            endIdx = uCountOfItems - 1;
        }
        //格子是否显示
        if (this._cellsUsed.count() > 0) {
            var cell = this._cellsUsed.objectAtIndex(0);

            idx = cell.getIdx();
            while (idx < startIdx) {
                this._moveCellOutOfSight(cell);
                if (this._cellsUsed.count() > 0) {
                    cell = this._cellsUsed.objectAtIndex(0);
                    idx = cell.getIdx();
                } else {
                    break;
                }
            }
        }

        if (this._cellsUsed.count() > 0) {
            var cell = this._cellsUsed.lastObject();
            idx = cell.getIdx();

            while (idx <= maxIdx && idx > endIdx) {
                this._moveCellOutOfSight(cell);
                if (this._cellsUsed.count() > 0) {
                    cell = this._cellsUsed.lastObject();
                    idx = cell.getIdx();
                } else {
                    break;
                }
            }
        }
        //添加cell
        for (var i = startIdx; i <= endIdx; i++) {
            if (this._indices.indexOf(i) !== -1) {
                continue;
            }
            this.updateCellAtIndex(i);
        }
    },
    /**
     * 获取可视区域的中心格子id（有效性验证）
     * @param offset
     * @returns {number}
     * @private
     */
    _indexFromOffset: function (offset) {
        var locOffset = {x: offset.x, y: offset.y};
        var locDataSource = this._dataSource;
        var maxIdx = locDataSource.numberOfCellsColumnInTableView(this) * locDataSource.numberOfCellsRowInTableView(this) - 1;

        if (this._vOrdering === cc.TABLEVIEW_FILL_TOPDOWN) {
            locOffset.y = this.getContainer().getContentSize().height - locOffset.y;
        }
        var index = this.__indexFromOffset(locOffset);
        if (index !== -1) {
            index = Math.max(0, index);
            if (index > maxIdx)
                index = cc.INVALID_INDEX;
        }
        return index;
    },

    /**
     * 获取可视区域的中心格子id
     * @param offset
     * @returns {number}
     * @private
     */
    __indexFromOffset: function (offset) {
        var col = this._dataSource.numberOfCellsColumnInTableView(this);
        var row = this._dataSource.numberOfCellsRowInTableView(this);

        var low = 0;
        var high = col * row - 1; //最大格子id
        var search;
        switch (this.getDirection()) {
            case cc.SCROLLVIEW_DIRECTION_HORIZONTAL:
                search = offset.x;
                break;
            default:
                search = offset.y;
                break;
        }

        while (high >= low) {
            var index = 0|(low + (high - low) / 2); //假定当前格子id
            var cellStart = 0;
            var cellEnd = 0;
            //假定当前格子的位置区间
            switch (this.getDirection()) {
                case cc.SCROLLVIEW_DIRECTION_HORIZONTAL:
                    cellStart = this._cellsPositions[index].x;
                    cellEnd = this._cellsPositions[index + 1].x;
                    break;
                default:
                    cellStart = this._cellsPositions[index].y;
                    cellEnd = this._cellsPositions[index + 1].y;
                    break;
            }

            //判断当前偏移位置是否在假定当前格子位置内
            if (search >= cellStart && search <= cellEnd) {
                switch (this.getDirection()) {
                    case cc.SCROLLVIEW_DIRECTION_HORIZONTAL:
                    {
                        var i = index % row;
                        var j = Math.floor(index / row);
                        if (i > 0) {
                            for (var k = j * row; k < (j + 1) * row; ++k) {
                                if (offset.y >= this._cellsPositions[k].y && offset.y <= this._cellsPositions[k + 1].y){
                                    return k;
                                }
                            }
                        }
                        return index;
                    }
                        break;
                    default:
                    {
                        var i = index % col; //列位置
                        var j = Math.floor(index / col); //行位置
                        //不在第一列
                        if (i > 0) {
                            //遍历该行所有列进行x坐标判断确认偏移量offset.x在第几个格子，返回格子id
                            for(var k = j * col; k <  (j + 1) * col; ++k) {
                                if(offset.x >= this._cellsPositions[k].x && offset.x <= this._cellsPositions[k + 1].x) {
                                    return k;
                                }
                            }
                        }
                        return index; //返回是第几个格子(第一列或最后一列直接返回假定格子id)
                    }
                        break;
                }
            } else if (search < cellStart) { //偏移量在格子开始位置之前，最大高度 ＝ 前一个格子
                high = index - 1;
            } else {
                low = index + 1;
            }
        }

        if (low <= 0) {
            return 0;
        }

        return -1;
    },
    /**
     * 更新单元的给定索引处的内容。
     * @param idx index to find a cell
     */
    updateCellAtIndex: function (idx) {
        if (idx === cc.INVALID_INDEX) {
            return;
        }
        var uCountOfItems = this._dataSource.numberOfCellsColumnInTableView(this) * this._dataSource.numberOfCellsRowInTableView(this);
        if (0 == uCountOfItems || idx > uCountOfItems - 1) {
            return;
        }

        var cell = this.cellAtIndex(idx);
        if (cell) {
            this._moveCellOutOfSight(cell);
        }
        cell = this._dataSource.tableCellAtIndex(this, idx);

        if (cell) {
            this._setIndexForCell(idx, cell);
            this._addCellIfNecessary(cell);
        }
    },
    /**
     * 移动细胞视线之外
     * @param cell
     * @private
     */
    _moveCellOutOfSight: function (cell) {
        if (this._tableViewDelegate && this._tableViewDelegate.tableCellWillRecycle) {
            this._tableViewDelegate.tableCellWillRecycle(this, cell);
        }

        this._cellsFreed.addObject(cell);
        this._cellsUsed.removeSortedObject(cell);
        cc.arrayRemoveObject(this._indices, cell.getIdx());

        cell.reset();
        if (cell.getParent() == this.getContainer()) {
            this.getContainer().removeChild(cell, true);
        }
    },
    /**
     * 添加细胞如果必要
     */
    _addCellIfNecessary: function (cell) {
        if (cell.getParent() !== this.getContainer()) {
            this.getContainer().addChild(cell);
        }
        this._cellsUsed.insertSortedObject(cell);
        this._indices.push(cell.getIdx());
    },
    /**
     * 根据index 设置cell的位置
     */
    _offsetFromIndex: function (index) {
        var offset = cc.clone(this.__offsetFromIndex(index));

        var cellSize = this._dataSource.tableCellSizeForIndex(this, index);
        if (this._vOrdering === cc.TABLEVIEW_FILL_TOPDOWN) {
            offset.y = this.getContainer().getContentSize().height - offset.y - cellSize.height;
        }
        return offset;
    },
    /**
     * 返回该index 的坐标信息
     * @param index
     * @returns {*}
     * @private
     */
    __offsetFromIndex: function (index) {
        return this._cellsPositions[index];
    },

    onTouchEnded: function (touch, event) {
        if (!this.isVisible()) {
            return;
        }
        if (this._touchedCell) {
            var bb = this.getBoundingBox();
            var tmpOrigin = cc.p(bb.x, bb.y);
            tmpOrigin = this._parent.convertToWorldSpace(tmpOrigin);
            bb.x = tmpOrigin.x;
            bb.y = tmpOrigin.y;
            var point = this.getContainer().convertTouchToNodeSpace(touch);
            if (cc.rectContainsPoint(bb, touch.getLocation()) && this._tableViewDelegate != null) {
                if (this._tableViewDelegate.tableCellTouched) {
                    this._tableViewDelegate.tableCellTouched(this, this._touchedCell, point);
                }
            }
            this._touchedCell = null;
        } else {
            if (this._tableViewDelegate && this._tableViewDelegate.tableCellTouchCancelled) {
                this._tableViewDelegate.tableCellTouchCancelled(this, null, cc.p(0, 0));
            }
        }

        cc.ScrollView.prototype.onTouchEnded.call(this, touch, event);
    },

    onTouchBegan: function (touch, event) {
        if (!this.isVisible()) {
            return false;
        }

        var touchResult = cc.ScrollView.prototype.onTouchBegan.call(this, touch, event);

        if (this._touches.length == 1) {
            var index, point;

            point = this.getContainer().convertTouchToNodeSpace(touch);

            index = this._indexFromOffset(point);
            if (index == cc.INVALID_INDEX) {
                this._touchedCell = null;
            } else {
                this._touchedCell = this.cellAtIndex(index);
            }

            if (this._touchedCell && this._tableViewDelegate !== null && this._tableViewDelegate.tableCellTouchBegan) {
                this._tableViewDelegate.tableCellTouchBegan(this, this._touchedCell, point);
            }
        } else if (this._touchedCell) {
            if (this._tableViewDelegate != null && this._tableViewDelegate.tableCellTouchCancelled) {
                var point = this.getContainer().convertTouchToNodeSpace(touch);
                this._tableViewDelegate.tableCellTouchCancelled(this, this._touchedCell, point);
            }

            this._touchedCell = null;
        }

        return touchResult;
    },

    onTouchMoved: function (touch, event) {
        cc.ScrollView.prototype.onTouchMoved.call(this, touch, event);

        if (this._touchedCell && this.isTouchMoved()) {
            if (this._tableViewDelegate != null && this._tableViewDelegate.tableCellTouchMoved) {
                var point = this.getContainer().convertTouchToNodeSpace(touch);
                this._tableViewDelegate.tableCellTouchMoved(this, this._touchedCell, point);
            }

            this._touchedCell = null;
        }
    },

    onTouchCancelled: function (touch, event) {
        cc.ScrollView.prototype.onTouchCancelled.call(this, touch, event);

        if (this._touchedCell) {
            if (this._tableViewDelegate != null && this._tableViewDelegate.tableCellTouchCancelled) {
                var point = this.getContainer().convertTouchToNodeSpace(touch);
                this._tableViewDelegate.tableCellTouchCancelled(this, this._touchedCell, point);
            }

            this._touchedCell = null;
        }
    },

    resetScroll: function () {
        if (this._direction == cc.SCROLLVIEW_DIRECTION_HORIZONTAL) {
            this.setContentOffset(cc.p(this.minContainerOffset().x, 0));
        } else {
            this.setContentOffset(cc.p(0, this.minContainerOffset().y));
        }
    },
    /**
     * 重新加载数据
     */
    reloadData: function () {
        this._oldDirection = cc.SCROLLVIEW_DIRECTION_NONE;
        for (var i = 0, len = this._cellsUsed.count(); i < len; i++) {
            var cell = this._cellsUsed.objectAtIndex(i);

            if(this._tableViewDelegate && this._tableViewDelegate.tableCellWillRecycle) {
                this._tableViewDelegate.tableCellWillRecycle(this, cell);
            }

            this._cellsFreed.addObject(cell);
            cell.reset();
            if (cell.getParent() == this.getContainer()) {
                this.getContainer().removeChild(cell, true);
            }
        }

        this._indices = [];
        this._cellsUsed = new cc.ArrayForObjectSorting();

        this._updateCellPositions();
        this._updateContentSize();
        if (this._dataSource.numberOfCellsColumnInTableView(this) > 0 || this._dataSource.numberOfCellsRowInTableView(this) > 0) {
            this.scrollViewDidScroll(this);
        }
    }
});

cc.MultiColTableView.create = function (dataSource, size, container) {
    var view = new cc.MultiColTableView(dataSource, size, container);
    return view;
};