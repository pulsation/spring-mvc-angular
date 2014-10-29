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

});
