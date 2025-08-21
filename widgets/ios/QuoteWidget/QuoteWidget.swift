import WidgetKit
import SwiftUI

struct QuoteEntry: TimelineEntry {
    let date: Date
    let id: String?
    let text: String
    let author: String?
    let background: Color
    let foreground: Color
    let deepLinkURL: URL?
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> QuoteEntry {
        QuoteEntry(date: Date(), id: nil, text: "Loading…", author: nil, background: Color(UIColor.systemBackground), foreground: Color(UIColor.label), deepLinkURL: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (QuoteEntry) -> ()) {
        completion(loadEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<QuoteEntry>) -> ()) {
        let entry = loadEntry()
        let nextRefresh = Calendar.current.date(byAdding: .hour, value: 3, to: Date()) ?? Date().addingTimeInterval(10800)
        completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
    }

    private func loadEntry() -> QuoteEntry {
        let groupId = "group.com.quotespark.dailyinspiration"
        var text = "Stay inspired."
        var author: String? = nil
        var id: String? = nil
        var background = Color(UIColor.systemBackground)
        var foreground = Color(UIColor.label)
        var deepLink: URL? = nil

        if let defaults = UserDefaults(suiteName: groupId),
           let jsonString = defaults.string(forKey: "widgetQuote"),
           let data = jsonString.data(using: .utf8),
           let dict = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            text = dict["text"] as? String ?? text
            author = dict["author"] as? String
            id = dict["id"] as? String
            if let bgHex = dict["bg"] as? String { background = Color(hex: bgHex) }
            if let fgHex = dict["fg"] as? String { foreground = Color(hex: fgHex) }
        }

        if let id = id, let url = URL(string: "quote://quote-detail/\(id)") {
            deepLink = url
        }

        return QuoteEntry(date: Date(), id: id, text: text, author: author, background: background, foreground: foreground, deepLinkURL: deepLink)
    }
}

struct QuoteWidgetEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        let content = ZStack(alignment: .topLeading) {
            entry.background
            VStack(alignment: .leading, spacing: 6) {
                Text(entry.text)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(entry.foreground)
                    .lineLimit(4)
                if let author = entry.author {
                    Text(author)
                        .font(.system(size: 12, weight: .regular))
                        .foregroundColor(entry.foreground.opacity(0.85))
                        .lineLimit(1)
                }
            }
            .padding(12)
        }

        if #available(iOSApplicationExtension 17.0, *) {
            content
                .containerBackground(for: .widget) { entry.background }
                .widgetURL(entry.deepLinkURL)
        } else {
            content
                .widgetURL(entry.deepLinkURL)
        }
    }
}

@main
struct QuoteWidget: Widget {
    let kind: String = "QuoteWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            QuoteWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("QuoteSpark")
        .description("Shows your favorite or a random quote.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

// MARK: - Utilities
extension Color {
    init(hex: String) {
        let hexSanitized = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hexSanitized).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hexSanitized.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(.sRGB, red: Double(r) / 255, green: Double(g) / 255, blue: Double(b) / 255, opacity: Double(a) / 255)
    }
}


