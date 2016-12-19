/**
 * External dependencies
 */
import config from 'config';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import test from 'selenium-webdriver/testing';
import { WebDriverManager, WebDriverHelper as helper } from 'wp-e2e-webdriver';
import { WPLogin } from 'wp-e2e-page-objects';

/**
 * Internal dependencies
 */
import { WPAdminWCSettingsProductsDownloadable } from '../../src/index';

chai.use( chaiAsPromised );
const assert = chai.assert;

let manager;
let driver;

test.before( 'Setup browser', function() {
	this.timeout( config.get( 'startBrowserTimeoutMs' ) );

	manager = new WebDriverManager( 'chrome', { baseUrl: config.get( 'url' ) } );
	driver = manager.getDriver();

	helper.clearCookiesAndDeleteLocalStorage( driver );
} );

test.describe( 'WooCommerce Products > Downloadable Products Settings', function() {
	this.timeout( config.get( 'mochaTimeoutMs' ) );

	test.before( 'Login', () => {
		const wpLogin = new WPLogin( driver, { url: manager.getPageUrl( '/wp-login.php' ) } );
		wpLogin.login( config.get( 'users.admin.username' ), config.get( 'users.admin.password' ) );
	} );

	test.it( 'can update settings', () => {
		const settingsArgs = { url: manager.getPageUrl( '/wp-admin/admin.php?page=wc-settings&tab=products&section=downloadable' ) };
		const settings = new WPAdminWCSettingsProductsDownloadable( driver, settingsArgs );

		assert.eventually.ok( settings.hasActiveTab( 'Products' ) );
		assert.eventually.ok( settings.hasActiveSubTab( 'Downloadable Products' ) );

		settings.selectFileDownloadMethod( 'Redirect only' );
		settings.checkDownloadsRequireLogin();
		settings.checkGrantAccessAfterPayment();
		settings.saveChanges();
		assert.eventually.ok( settings.hasNotice( 'Your settings have been saved.' ) );

		settings.selectFileDownloadMethod( 'Force Downloads' );
		settings.uncheckDownloadsRequireLogin();
		settings.uncheckGrantAccessAfterPayment();
		settings.saveChanges();
		assert.eventually.ok( settings.hasNotice( 'Your settings have been saved.' ) );
	} );
} );

test.after( 'Quit browser', () => {
	manager.quitBrowser();
} );