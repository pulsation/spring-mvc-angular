describe('Calculate hompage', function() {
  beforeEach(function() {
    browser.get('/');
  });

  it('should calculate square(25)', function() {
    element(by.model('operation.operand')).sendKeys('25');

    var result = element(by.binding('operation.resultPartial'));
    expect(result.getText()).toContain('Result: 625');

  });

  it('should save result', function () {
    element(by.model('operation.operand')).sendKeys('5');
    var saveButton = element(by.css('button[type="submit"]'));
    saveButton.click();
    var successAlert = element(by.css('div[ng-show="saveStatus === true"]'));
    expect(successAlert.isDisplayed()).toBeTruthy();
  });

  it('should add result to history', function () {
    element(by.model('operation.operand')).sendKeys('3');
    var saveButton = element(by.css('button[type="submit"]'));
    saveButton.click();

    var lastRow = element.all( by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by row.uid')  )
    .filter(function (row, index) {
        var cols = row.all( by.repeater('(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name'));
        return cols.get(0).getText().then(function(text) {
            return (text == "3^2");
        });
    })
    .each(function (row) {
        var cols = row.all( by.repeater('(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name'));
        cols.get(1).then(function(col) {
            expect(col.getText()).toBe("9");
        });
    });
  });

});
