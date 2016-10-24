using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;
using System.Xml.Linq;
namespace BotUI
{
    public class UIBuilder
    {
        public enum Animation
        {
            enter,
            shrug,
            thinking,
            head_bump,
            got_it,
            point_up,
            cheer,
            smile,
            smile_end,
            frown,
            frown_end,
            spin_around,
            fist_pump,
            dance,
            antenna_glow,
            wave_flag,
            wave_flag_end
        }
        public static XDocument CreateDialog()
        {
            XDocument doc = new XDocument(
                        new XElement("dialog")
            );
            doc.Root.SetAttributeValue("id", Guid.NewGuid().ToString());
            return doc;
        }

        public static void AppendBulletList(XDocument document, IEnumerable<string> items)
        {
            XElement list = new XElement("list");
            document.Root.Add(list);

            foreach (string item in items)
            {
                XElement listItem = new XElement("listItem");
                list.Add(listItem);
                listItem.Value = item;
            }
        }

        public static void AppendAnimation(XDocument document, Animation animation)
        {
            XElement list = new XElement("animation");
            document.Root.Add(list);
            list.SetAttributeValue("kind", animation.ToString());
        }

        public static void AppendLabel(XDocument document, string label)
        {
            XElement labelElement = new XElement("label");
            labelElement.Value = label;
            document.Root.Add(labelElement);
        }
        public static void AppendCalendar(XDocument document, DateTime date)
        {
            XElement element = new XElement("calendar");
            element.Value = date.ToString();
            document.Root.Add(element);
        }
        public static void AppendImage(XDocument document, string url)
        {
            XElement imageElement = new XElement("image");
            imageElement.Value = url;
            document.Root.Add(imageElement);
        }

        public static void AppendIframe(XDocument document, string url)
        {
            XElement imageElement = new XElement("iframe");
            imageElement.Value = url;
            document.Root.Add(imageElement);
        }
        public static void AppendMusic(XDocument document, string url)
        {
            XElement element = new XElement("music");
            element.Value = url;
            document.Root.Add(element);
        }

        public static void SetClearScreen(XDocument document, bool clear)
        {
            document.Root.SetAttributeValue("clearScreen", clear);
        }
        public static Guid GetId(XDocument dialog)
        {
            return Guid.Parse(dialog.Root.Attribute("dialog").Value);
        }
    }
}
