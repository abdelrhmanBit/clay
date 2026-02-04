import axios from "axios";
import cheerio from "cheerio";
import PDFDocument from "pdfkit";

// ---------- arabtoons Object Definition ----------
const arabtoons = {
  domin: "https://arabtoons.net/",
  headers: {
    Host: "arabtoons.net",
    Connection: "keep-alive",
    "sec-ch-ua": '"Chromium";v="136", "Android WebView";v="136", "Not.A/Brand";v="99"',
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": '"Android"',
    "Upgrade-Insecure-Requests": "1",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    dnt: "1",
    "save-data": "on",
    "X-Requested-With": "mark.via.gp",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-User": "?1",
    "Sec-Fetch-Dest": "document",
    "Accept-Language": "ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7",
  },

  // Fetch homepage data: sections & latest stories
  data: async function () {
    try {
      const response = await axios.get(arabtoons.domin, {
        headers: arabtoons.headers,
      });
      const html = response.data;
      const $ = cheerio.load(html);

      const sections = { main: [], category: [] };
      const mainMap = new Map();

      // Main navbar sections
      $(".main-navbar li").each((i, el) => {
        const nameMain = $(el).find("a").text().trim();
        const urlMain = $(el).find("a").attr("href");
        const key = `${nameMain}|${urlMain}`;
        if (nameMain && urlMain && !mainMap.has(key)) {
          mainMap.set(key, true);
          sections.main.push({ name: nameMain, url: urlMain });
        }
      });

      // Sub-navigation categories
      $(".sub-nav_list li").each((i, el) => {
        const nameCategory = $(el).find("a").text().trim();
        const urlCategory = $(el).find("a").attr("href");
        if (nameCategory && urlCategory) {
          sections.category.push({ name: nameCategory, url: urlCategory });
        }
      });

      // Latest stories on homepage
      const latestStories = [];
      $(
        ".col-6.col-sm-4.col-md-4.col-lg-2.col-xl-2.badge-pos-2"
      ).each((i, el) => {
        const item = $(el);
        const linkStorie = item.find(".item-thumb a").attr("href");
        const titleStorie = item.find(".post-title a").text().trim();
        const imageStorie = item.find(".item-thumb img").attr("src");
        const typeStorie = item.find(".overlay-manga .manga-type").text().trim();
        const latestChapterStorie = item
          .find(".list-chapter .chapter-item")
          .first()
          .find("a")
          .attr("href");
        const chapterTitleStorie = item
          .find(".list-chapter .chapter-item")
          .first()
          .find("a")
          .text()
          .trim();

        latestStories.push({
          title: titleStorie,
          link: linkStorie,
          image: imageStorie,
          type: typeStorie,
          latestChapter: {
            title: chapterTitleStorie,
            url: latestChapterStorie,
          },
        });
      });

      return { sections, latestStories };
    } catch (err) {
      return { error: true, message: err.message, stack: err.stack };
    }
  },

  // Get homepage info: type 1=main sections, 2=categories, 3=latest stories
  home: async function (type, selecte) {
    const homeData = await arabtoons.data();
    if (homeData.error) return homeData;
    const { sections, latestStories } = homeData;
    const { main, category } = sections;

    if (!type || type < 1 || type > 3) {
      return {
        status: "error",
        message:
          "الرجاء اختيار نوع صالح:\n1 - الصفحة الرئيسية\n2 - الفئات\n3 - القصص الحديثة",
      };
    }

    // Type 1: Main sections
    if (type === 1) {
      if (!selecte || selecte < 1 || selecte > main.length) {
        const options = main.map((m, i) => ({
          index: i + 1,
          title: m.name,
        }));
        return {
          status: "error",
          message: "الرجاء اختيار قسم من الرئيسية.",
          options,
        };
      }

      const selected = main[selecte - 1];
      const res = await axios.get(
        selected.url === "/" ? arabtoons.domin : selected.url,
        { headers: arabtoons.headers }
      );
      const $ = cheerio.load(res.data);

      const items = [];
      $(
        ".col-6.col-sm-4.col-md-4.col-lg-2.col-xl-2.badge-pos-2"
      ).each((_, el) => {
        const item = $(el);
        const title = item.find(".post-title a").text().trim();
        const url = item.find(".item-thumb a").attr("href");
        const image = item.find(".item-thumb img").attr("src");
        const type = item.find(".manga-type").text().trim();
        const latestChapter = item
          .find(".list-chapter .chapter-item")
          .first()
          .find("a")
          .text()
          .trim();
        const latestChapterUrl = item
          .find(".list-chapter .chapter-item")
          .first()
          .find("a")
          .attr("href");

        if (title && url) {
          items.push({
            title,
            url,
            image,
            type,
            latestChapter: { title: latestChapter, url: latestChapterUrl },
          });
        }
      });

      return {
        status: "success",
        section: selected.name,
        count: items.length,
        results: items,
      };
    }

    // Type 2: Categories
    if (type === 2) {
      if (!selecte || selecte < 1 || selecte > category.length) {
        const options = category.map((c, i) => ({
          index: i + 1,
          title: c.name,
        }));
        return {
          status: "error",
          message: "الرجاء اختيار فئة.",
          options,
        };
      }

      const selected = category[selecte - 1];
      const res = await axios.get(selected.url, { headers: arabtoons.headers });
      const $ = cheerio.load(res.data);

      const items = [];
      $(
        ".col-6.col-sm-4.col-md-4.col-lg-2.col-xl-2.badge-pos-2"
      ).each((_, el) => {
        const item = $(el);
        const title = item.find(".post-title a").text().trim();
        const url = item.find(".item-thumb a").attr("href");
        const image = item.find(".item-thumb img").attr("src");
        const type = item.find(".manga-type").text().trim();
        const latestChapter = item
          .find(".list-chapter .chapter-item")
          .first()
          .find("a")
          .text()
          .trim();
        const latestChapterUrl = item
          .find(".list-chapter .chapter-item")
          .first()
          .find("a")
          .attr("href");

        if (title && url) {
          items.push({
            title,
            url,
            image,
            type,
            latestChapter: { title: latestChapter, url: latestChapterUrl },
          });
        }
      });

      return {
        status: "success",
        category: selected.name,
        count: items.length,
        results: items,
      };
    }

    // Type 3: Latest Stories
    if (type === 3) {
      if (!selecte || selecte < 1 || selecte > latestStories.length) {
        const options = latestStories.map((s, i) => ({
          index: i + 1,
          title: s.title,
        }));
        return {
          status: "error",
          message: "الرجاء اختيار قصة من القائمة الحديثة.",
          options,
        };
      }

      const selected = latestStories[selecte - 1];
      return {
        status: "success",
        title: selected.title,
        url: selected.link,
        image: selected.image,
        type: selected.type,
        latestChapter: selected.latestChapter,
      };
    }
  },

  // Search by query
  
  
  search: async function (query) {
    const params = new URLSearchParams({
      s: query,
      post_type: "wp-manga",
    });

    const baseURL = `${arabtoons.domin}?${params.toString()}`;
    const response = await axios.get(baseURL, { headers: arabtoons.headers });

    const html = response.data;
    const $ = cheerio.load(html);
    const results = [];

    const elements = $(".c-tabs-item__content").toArray();

    for (const el of elements) {
      const element = $(el);

      const title = element.find(".post-title h3 a").text().trim();
      const url = element.find(".post-title h3 a").attr("href");
      const img = element.find(".tab-thumb img").attr("src");

      const alternativeNames = element
        .find(".mg_alternative .summary-content")
        .text()
        .trim();
      const author = element.find(".mg_author .summary-content").text().trim();
      const artist = element.find(".mg_artists .summary-content").text().trim();
      const genres = element
        .find(".mg_genres .summary-content a")
        .map((_, g) => $(g).text().trim())
        .get();
      const status = element.find(".mg_status .summary-content").text().trim();
      const releaseYear = element
        .find(".mg_release .summary-content")
        .text()
        .trim();

      const latestChapterTitle = element
        .find(".latest-chap .chapter a")
        .text()
        .trim();
      const latestChapterUrl = element
        .find(".latest-chap .chapter a")
        .attr("href");

      const chapters = await (async function getChapters(mangaUrl) {
        const { data: html } = await axios.get(mangaUrl, {
          headers: arabtoons.headers,
        });
        const $ = cheerio.load(html);
        const chapters = [];

        $("ul.version-chap li.wp-manga-chapter").each((_, el) => {
          chapters.push({
            title: $(el).find("a").text().trim(),
            url: $(el).find("a").attr("href"),
            releaseDate: $(el).find(".chapter-release-date").text().trim(),
          });
        });

        const description =
          $(".summary-text").text().trim() ||
          $(".summary__content").text().trim() ||
          $(".description-summary").text().trim();

        return { chapters, description };
      })(url);

      results.push({
        title,
        description: chapters.description,
        url,
        img,
        alternativeNames,
        author,
        artist,
        genres,
        status,
        releaseYear,
        latestChapter: {
          title: latestChapterTitle,
          url: latestChapterUrl,
        },
        rating: element.find(".post-total-rating .score").text().trim(),
        chapters: chapters.chapters,
      });
    }

    return results;
  },

  // Get all image URLs from a chapter page
  download: async function (chapterUrl) {
    const { data: html } = await axios.get(chapterUrl, {
      headers: arabtoons.headers,
    });
    const $ = cheerio.load(html);
    const images = [];
    $(".reading-content .wp-manga-chapter-img").each((_, el) => {
      const src = $(el).attr("src");
      if (src) images.push(src.trim());
    });
    return images;
  },

  // Convert array of image URLs into a PDF Buffer
  bdf: async function (imageUrls) {
    const doc = new PDFDocument({ autoFirstPage: false });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {});

    for (const url of imageUrls) {
      try {
        const res = await axios.get(url, { responseType: "arraybuffer" });
        const img = doc.openImage(res.data);
        doc.addPage({ size: [img.width, img.height] });
        doc.image(img, 0, 0);
      } catch (err) {
        console.warn(`فشل تحميل الصورة: ${url}`);
      }
    }

    doc.end();

    return await new Promise((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);
    });
  },
};

// ---------- Command Handler ----------
const handler = async (m, { conn, usedPrefix, command, text }) => {
  // نص الأمر بعد 'بونتس'
  const args = text.trim().split(/\s+/);
  const subcmd = args.shift(); // 'الجديد' أو 'بحث' أو 'تفاصيل' أو 'تحميل'
  const input = args.join(" ").trim(); // بقية النص

  conn.arabtoons = conn.arabtoons || {};
  conn.arabtoons[m.sender] = conn.arabtoons[m.sender] || {};


  try {
    switch (subcmd) {
      // ------------------ أمر "الجديد" ------------------
      case "الجديد": {
        // إذا لم يُعطَ رقم، عرض قائمة أحدث القصص
        if (!input) {
          const homeData = await arabtoons.data();
          if (homeData.error) {
            return conn.sendMessage(
              m.chat,
              { text: `❌ خطأ أثناء جلب البيانات:\n${homeData.message}` },
              { quoted: m }
            );
          }
          const { latestStories } = homeData;
          if (!latestStories.length) {
            return conn.sendMessage(
              m.chat,
              { text: "لا توجد قصص حديثة في الوقت الحالي." },
              { quoted: m }
            );
          }

          // بناء رسالة القائمة
          let listMsg = "*📋 أحدث القصص:*\n\n";
          latestStories.forEach((s, i) => {
            listMsg += `*${i + 1}.* ${s.title}\n`;
          });
          listMsg +=
            `\nللحصول على تفاصيل قصة معينة:\n` +
            `استخدم الأمر: \`${usedPrefix}${command} الجديد <رقم القصة>\``;

          return conn.sendMessage(
            m.chat,
            { text: listMsg },
            { quoted: m }
          );
        }

        // إذا عُطِي رقم index، عرض تفاصيل القصة
        const idx = parseInt(input);
        if (isNaN(idx)) {
          return conn.sendMessage(
            m.chat,
            { text: "❌ الرجاء إرسال رقم صالح بعد الأمر." },
            { quoted: m }
          );
        }

        const homeData = await arabtoons.data();
        if (homeData.error) {
          return conn.sendMessage(
            m.chat,
            {
              text: `❌ خطأ أثناء جلب البيانات:\n${homeData.message}`,
            },
            { quoted: m }
          );
        }
        const { latestStories } = homeData;
        if (idx < 1 || idx > latestStories.length) {
          return conn.sendMessage(
            m.chat,
            { text: "❌ الرقم خارج النطاق." },
            { quoted: m }
          );
        }

        const story = latestStories[idx - 1];
        const detailMsg =
          `*📖 عنوان:* ${story.title}\n` +
          `*🌐 الرابط:* ${story.link}\n` +
          `*🖼️ صورة:* ${story.image}\n` +
          `*📚 النوع:* ${story.type}\n` +
          `*📝 الفصل الأخير:* ${story.latestChapter.title}\n` +
          `*🔗 رابط الفصل:* ${story.latestChapter.url}\n\n` +
          `لتحميل الفصل الأخير استخدم:\n` +
          `\`${usedPrefix}${command} تحميل ${story.latestChapter.url}\``;

        return conn.sendMessage(
          m.chat,
          { text: detailMsg },
          { quoted: m }
        );
      }

      // ------------------ أمر "بحث" ------------------
      case "بحث": {
        if (!input) {
          return conn.sendMessage(
            m.chat,
            { text: "❌ الرجاء إضافة كلمة البحث بعد الأمر." },
            { quoted: m }
          );
        }

        const results = await arabtoons.search(input);
        if (!results.length) {
          return conn.sendMessage(
            m.chat,
            { text: "⚠️ لم يتم العثور على نتائج." },
            { quoted: m }
          );
        }

      conn.arabtoons[m.sender].resultSrearch = results;

        // عرض قائمة النتائج مع الأرقام
        let listMsg = `*🔍 نتائج البحث عن "${input}":*\n\n`;
        results.forEach((r, i) => {
          listMsg += `*${i + 1}.* ${r.title}\n`;
        });
        listMsg +=
          `\nللحصول على تفاصيل السلسلة:\n` +
          `استخدم الأمر: \`${usedPrefix}${command} تفاصيل <رقم السلسلة>\``;

        return conn.sendMessage(
          m.chat,
          { text: listMsg },
          { quoted: m }
        );
      }

      // ------------------ أمر "تفاصيل" ------------------
      case "تفاصيل": {
        if (!input) {
          return conn.sendMessage(
            m.chat,
            { text: "❌ الرجاء إضافة رقم السلسلة بعد الأمر." },
            { quoted: m }
          );
        }
        const idx = parseInt(input);
        if (isNaN(idx)) {
          return conn.sendMessage(
            m.chat,
            { text: "❌ الرجاء إرسال رقم صالح." },
            { quoted: m }
          );
        }
        
        const lastQuery = input;
        const results = conn.arabtoons[m.sender].resultSrearch;
        
        if (!results.length) {
          return conn.sendMessage(
            m.chat,
            { text: "⚠️ لم يتم العثور على نتائج." },
            { quoted: m }
          );
        }
        if (idx < 1 || idx > results.length) {
          return conn.sendMessage(
            m.chat,
            { text: "❌ الرقم خارج النطاق." },
            { quoted: m }
          );
        }

        const item = results[idx - 1];
        
        conn.arabtoons[m.sender].resultSelect = item;
        
        let detailMsg = `*📚 عنوان:* ${item.title}\n`;
        if (item.alternativeNames)
          detailMsg += `*📛 أسماء بديلة:* ${item.alternativeNames}\n`;
        if (item.author) detailMsg += `*✍️ مؤلف:* ${item.author}\n`;
        if (item.artist) detailMsg += `*🎨 رسام:* ${item.artist}\n`;
        if (item.genres && item.genres.length)
          detailMsg += `*🔖 الأنواع:* ${item.genres.join(", ")}\n`;
        if (item.status) detailMsg += `*📑 الحالة:* ${item.status}\n`;
        if (item.releaseYear)
          detailMsg += `*📅 سنة الإصدار:* ${item.releaseYear}\n`;
        if (item.rating) detailMsg += `*⭐ التقييم:* ${item.rating}\n`;
        detailMsg += `*🌐 رابط السلسلة:* ${item.url}\n\n`;
        if (item.description)
          detailMsg += `*📝 الوصف:* ${item.description}\n\n`;

        // قائمة بالفصول
        if (item.chapters && item.chapters.length) {
          detailMsg += `*📖 الفصول:*\n`;
          item.chapters.forEach((chap, i) => {
            detailMsg += `• [${i + 1}] ${chap.title}\n`;
          });
          detailMsg += `\nلتحميل أي فصل، استخدم الأمر:\n\`${usedPrefix}${command} تحميل <رقم الفصل>\``;
        }

        return conn.sendMessage(
          m.chat,
          { text: detailMsg },
          { quoted: m }
        );
      }

      // ------------------ أمر "تحميل" ------------------
      case "تحميل": {
        if (!input) {
          return conn.sendMessage(
            m.chat,
            { text: "❌ الرجاء إضافة رابط الفصل بعد الأمر." },
            { quoted: m }
          );
        }
        
        const idx = parseInt(input);
        if (isNaN(idx)) {
          return conn.sendMessage(
            m.chat,
            { text: "❌ الرجاء إرسال رقم صالح." },
            { quoted: m }
          );
        }
        
        const story = conn.arabtoons[m.sender].resultSelect;
        
        const chapters = story.chapters;
        
        if (idx < 1 || idx > chapters.length) {
          return conn.sendMessage(
            m.chat,
            { text: "❌ الرقم خارج النطاق." },
            { quoted: m }
          );
        }
        
        const chapterUrl = chapters[idx - 1].url;
        const chapterName = chapters[idx - 1].title;

        // إبلاغ المستخدم ببدء التحميل والتحويل
        await conn.sendMessage(
          m.chat,
          { text: "⏳ جارٍ جمع صفحات الفصل وتحويلها إلى PDF..." },
          { quoted: m }
        );

        try {
          const images = await arabtoons.download(chapterUrl);
          if (!images.length) {
            return conn.sendMessage(
              m.chat,
              { text: "⚠️ لم يتم العثور على صور للفصل." },
              { quoted: m }
            );
          }
          const pdfBuffer = await arabtoons.bdf(images);
          const fileName = `${story.title}_${chapterName}.pdf`;

          // إرسال ملف الـ PDF
          return conn.sendMessage(
            m.chat,
            {
              document: pdfBuffer,
              mimetype: "application/pdf",
              fileName,
            },
            { quoted: m }
          );
        } catch (err) {
          console.error("خطأ أثناء تحميل الفصل أو إنشاء الـ PDF:", err);
          return conn.sendMessage(
            m.chat,
            { text: "❌ حدث خطأ أثناء تحميل الفصل أو إنشاء ملف PDF." },
            { quoted: m }
          );
        }
      }

      default:
        return conn.sendMessage(
          m.chat,
          {
            text:
              "❌ الأمر غير معروف.\n\n" +
              "إليك الأوامر المتاحة:\n" +
              `• ${usedPrefix}${command} الجديد\n` +
              `• ${usedPrefix}${command} بحث <كلمة البحث>\n` +
              `• ${usedPrefix}${command} تفاصيل <رقم السلسلة>\n` +
              `• ${usedPrefix}${command} تحميل <رابط الفصل>`,
          },
          { quoted: m }
        );
    }
  } catch (err) {
    console.error("Handler error:", err);
    await conn.sendMessage(
      m.chat,
      { text: "حدث خطأ\n" + err.message},
      { quoted: m }
    );
  }
};

handler.command = ["بونتس"];

export default handler;