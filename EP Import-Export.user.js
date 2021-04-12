// ==UserScript==
// @name         EP Import/Export
// @version      0.1
// @description  Adds import and export buttons to EP
// @author       Tuftelien
// @include      https://sixtyupgrades.com/*
// @include      https://seventyupgrades.com/*
// @include      https://eightyupgrades.com/*
// @match        https://sixtyupgrades.com/*
// @match        https://seventyupgrades.com/*
// @match        https://eightyupgrades.com/*
// @grant        none
// @require      http://code.jquery.com/jquery-latest.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

(function() {
    waitForKeyElements ("[class*=equivalency-point-editor]", function() {
        var container = $('[class*=equivalency-point-editor]').siblings('h3');

        var importButton = $('<button type="button">Import</button>')
        importButton.click(function () {
            var importData = prompt('Import: Paste into the textbox below')
            if (!importData) return;

            var importObject = JSON.parse(atob(importData));

            // Clear current points
            jQuery.fn.reverse = [].reverse; // idc
            $('[class*=equivalency-point-editor] > li [class*=point_removeButton]').reverse().click();

            // Holy shit what a clusterfuck this ended up being
            //https://github.com/facebook/react/issues/11488
            function reactJSSetValue(elm, newValue) {
                let input = elm;
                let lastValue = input.value;
                input.value = newValue;
                let event = new Event('change', { bubbles: true });
                // hack React15
                event.simulated = true;
                // hack React16 内部定义了descriptor拦截value，此处重置状态
                let tracker = input._valueTracker;
                if (tracker) {
                    tracker.setValue(lastValue);
                }
                input.dispatchEvent(event);
            }

            // Set name
            if (importObject.name) {
                var pointsName = $('[class*=equivalency-point-editor] > li').find('[name=name]');
                reactJSSetValue(pointsName.get(0), importObject.name);
            }

            for (var i = 0; i < importObject.points.length; i++) {
                var point = importObject.points[i];
                $('[class*=equivalency-point-editor] > li [class*=custom-section_addButton]').click();

                reactJSSetValue($('[class*=equivalency-point-editor] > li [class*=select-field_selectField] > select:last').get(0), point.name);
                reactJSSetValue($('[class*=equivalency-point-editor] > li [class*=point_statValue]:last').get(0), point.value);
                // it works and i'm out of fucks to give
            }
        });

        var exportButton = $('<button type="button">Export</button>')
        exportButton.click(function () {
            var points = $('[class*=equivalency-point-editor] > li');
            var exportData = { points: [] };
            points.each(function (i, point) {
                var $point = $(point);

                var pointsName = $point.find('[name=name]');
                if (pointsName.length > 0) {
                    exportData.name = pointsName.val();
                    return;
                }

                var name = $point.find('[class*=select-field_selectField] > select').val();
                var value = $point.find('input').val();

                if (!name) return;

                exportData.points.push({name, value});
            });
            console.log(exportData);
            prompt('Export: Copy from the textbox below', btoa(JSON.stringify(exportData)))
        });

        container.append(importButton).append(exportButton);
    });
})();