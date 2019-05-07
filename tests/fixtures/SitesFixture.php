<?php
/**
 * @link https://craftcms.com/
 * @copyright Copyright (c) Pixel & Tonic, Inc.
 * @license https://craftcms.github.io/license/
 */

namespace craftunit\fixtures;

use Craft;
use craft\records\Site;
use craft\services\Sites;
use craft\test\Fixture;

class SitesFixture extends Fixture
{
    public $modelClass = Site::class;
    public $dataFile = __DIR__.'/data/sites.php';

    public function load()
    {
        parent::load();

        // Because the Sites() class memoizes on initialization we need to set() a new sites class
        // with the updated fixture data

        Craft::$app->set('sites', new Sites());
    }
}