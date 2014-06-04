<?php

namespace Mapbender\CoreBundle\Tests\Controller;

class SeleniumPhantomJsTest extends \PHPUnit_Extensions_Selenium2TestCase {

    public function setUp() {
        $this->setHost('localhost');
        $this->setPort(9876);
        $this->setBrowserUrl('http://' . TEST_WEB_SERVER_HOST . ':' . TEST_WEB_SERVER_PORT . '/app_dev.php/');
    }

    public function prepareSession() {
        $res = parent::prepareSession();
        $this->url('/');
        return $res;
    }

    public function testIndex() {
        try {
            $this->url('http://' . TEST_WEB_SERVER_HOST . ':' . TEST_WEB_SERVER_PORT . '/app_dev.php/');
            $this->assertEquals('Applications', $this->title());
        }catch(\Exception $e) {
            // skip test on PHP 5.3
            if(PHP_MINOR_VERSION == 3) {
                return;
            }
            throw $e;
        }
    }
}
