from .aux import get_url


def addwms(wd, url='http://osm-demo.wheregroup.com/service?REQUEST=GetCapabilities'):
    wd.find_element_by_link_text("Add source").click()
    wd.find_element_by_id("wmssource_originUrl").send_keys(url)
    wd.find_element_by_name("load").click()
    if not ("Your WMS has been created" in wd.find_element_by_tag_name("html").text):
        raise Exception("verifyTextPresent failed:\n" + wd.find_element_by_tag_name("html"))

def deletewms(wd):
    if not ("Sources" in wd.find_element_by_tag_name("html").text):
        raise Exception("verifyTextPresent failed: Sources")
    wd.find_element_by_link_text("Sources").click()
    if not (len(wd.find_elements_by_css_selector("span.iconRemove.iconBig")) != 0):
        raise Exception("verifyTextPresent failed: span.iconRemove.iconBig")
    wd.find_element_by_css_selector("span.iconRemove.iconBig").click()
    wd.find_element_by_link_text("Delete").click()
    if not ("Your WMS has been deleted" in wd.find_element_by_tag_name("html").text):
        raise Exception("verifyTextPresent failed: Your WMS has been deleted")
