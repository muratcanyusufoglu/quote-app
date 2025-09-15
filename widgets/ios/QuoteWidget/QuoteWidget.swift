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
        let placeholderTexts = [
            "Loading inspiration...",
            "Finding wisdom...",
            "Preparing quote...",
            "Stay inspired...",
            "Loading quote..."
        ]
        
        let randomText = placeholderTexts.randomElement() ?? "Loading..."
        print("📱 Widget: Placeholder gösteriliyor - \(randomText)")
        
        return QuoteEntry(
            date: Date(), 
            id: nil, 
            text: randomText, 
            author: nil, 
            background: Color(UIColor.systemBackground), 
            foreground: Color(UIColor.label), 
            deepLinkURL: nil
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (QuoteEntry) -> ()) {
        let entry = loadEntry()
        print("📱 Widget: Snapshot oluşturuluyor - \(entry.text.prefix(30))...")
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<QuoteEntry>) -> ()) {
        let entry = loadEntry()
        
        // Widget'ı daha sık güncelle (1 saat yerine 30 dakika)
        let nextRefresh = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date().addingTimeInterval(1800)
        
        print("📱 Widget: Timeline oluşturuluyor - sonraki güncelleme: \(nextRefresh)")
        
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

        if let defaults = UserDefaults(suiteName: groupId) {
            print("📱 Widget: App Group bulundu: \(groupId)")
            
            if let jsonString = defaults.string(forKey: "widgetQuote") {
                print("📱 Widget: JSON string bulundu, uzunluk: \(jsonString.count)")
                
                if let data = jsonString.data(using: .utf8) {
                    do {
                        if let dict = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
                            
                            // Log widget data for debugging
                            print("📱 Widget: JSON data loaded - \(dict)")
                            
                            text = dict["text"] as? String ?? text
                            author = dict["author"] as? String
                            id = dict["id"] as? String
                            
                            if let bgHex = dict["bg"] as? String { 
                                background = Color(hex: bgHex)
                                print("🎨 Widget: Background color set to \(bgHex)")
                            }
                            if let fgHex = dict["fg"] as? String { 
                                foreground = Color(hex: fgHex)
                                print("🎨 Widget: Foreground color set to \(fgHex)")
                            }
                            
                            print("📱 Widget: Quote loaded - ID: \(id ?? "nil"), Text: \(text.prefix(30))..., Author: \(author ?? "nil")")
                        } else {
                            print("⚠️ Widget: JSON parsing failed - dict is nil")
                        }
                    } catch {
                        print("❌ Widget: JSON parsing error: \(error)")
                    }
                } else {
                    print("⚠️ Widget: JSON string to data conversion failed")
                }
            } else {
                print("⚠️ Widget: 'widgetQuote' key not found in App Group")
            }
        } else {
            print("❌ Widget: App Group not found: \(groupId)")
        }

        if let id = id, let url = URL(string: "quote://quote-detail/\(id)") {
            deepLink = url
            print("🔗 Widget: Deep link created for quote \(id)")
        } else {
            print("⚠️ Widget: Deep link creation failed for ID: \(id ?? "nil")")
        }

        return QuoteEntry(date: Date(), id: id, text: text, author: author, background: background, foreground: foreground, deepLinkURL: deepLink)
    }
}

struct QuoteWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        let content = ZStack(alignment: .topLeading) {
            entry.background
                .ignoresSafeArea()
            
            VStack(alignment: .leading, spacing: getSpacing()) {
                Text(entry.text)
                    .font(getQuoteFont())
                    .fontWeight(.semibold)
                    .foregroundColor(entry.foreground)
                    .lineLimit(getLineLimit())
                    .minimumScaleFactor(0.7)
                    .multilineTextAlignment(.leading)
                
                if let author = entry.author, !author.isEmpty {
                    Spacer(minLength: 4)
                    Text("— \(author)")
                        .font(getAuthorFont())
                        .foregroundColor(entry.foreground.opacity(0.8))
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                }
            }
            .padding(getPadding())
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
    
    private func getQuoteFont() -> Font {
        switch family {
        case .systemSmall:
            return .system(size: 16, weight: .semibold)
        case .systemMedium:
            return .system(size: 18, weight: .semibold)
        case .systemLarge:
            return .system(size: 20, weight: .semibold)
        default:
            return .system(size: 18, weight: .semibold)
        }
    }
    
    private func getAuthorFont() -> Font {
        switch family {
        case .systemSmall:
            return .system(size: 12, weight: .medium)
        case .systemMedium:
            return .system(size: 14, weight: .medium)
        case .systemLarge:
            return .system(size: 16, weight: .medium)
        default:
            return .system(size: 14, weight: .medium)
        }
    }
    
    private func getLineLimit() -> Int {
        switch family {
        case .systemSmall:
            return 3
        case .systemMedium:
            return 4
        case .systemLarge:
            return 6
        default:
            return 4
        }
    }
    
    private func getSpacing() -> CGFloat {
        switch family {
        case .systemSmall:
            return 3
        case .systemMedium:
            return 4
        case .systemLarge:
            return 6
        default:
            return 4
        }
    }
    
    private func getPadding() -> CGFloat {
        switch family {
        case .systemSmall:
            return 10
        case .systemMedium:
            return 12
        case .systemLarge:
            return 16
        default:
            return 12
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
        .description("Shows your favorite quotes or random inspiration. Updates automatically and with theme changes.")
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
            // Geçersiz hex format için varsayılan renkler
            print("⚠️ Widget: Geçersiz hex format: \(hex), varsayılan renk kullanılıyor")
            (a, r, g, b) = (255, 0, 0, 0)
        }
        
        let red = Double(r) / 255
        let green = Double(g) / 255
        let blue = Double(b) / 255
        let opacity = Double(a) / 255
        
        print("🎨 Widget: Renk oluşturuluyor - R:\(red), G:\(green), B:\(blue), A:\(opacity) from \(hex)")
        
        self.init(.sRGB, red: red, green: green, blue: blue, opacity: opacity)
    }
}


