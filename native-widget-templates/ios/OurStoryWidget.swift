import WidgetKit
import SwiftUI

struct OurStoryEntry: TimelineEntry {
    let date: Date
    let title: String
    let text: String
    let meta: String
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> OurStoryEntry {
        OurStoryEntry(date: Date(), title: "OurStory", text: "Bir hatira sec ve widget yap.", meta: "Ayse & Mert")
    }

    func getSnapshot(in context: Context, completion: @escaping (OurStoryEntry) -> Void) {
        completion(loadEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<OurStoryEntry>) -> Void) {
        completion(Timeline(entries: [loadEntry()], policy: .never))
    }

    private func loadEntry() -> OurStoryEntry {
        let defaults = UserDefaults(suiteName: "group.com.ourstory.aysemert")
        return OurStoryEntry(
            date: Date(),
            title: defaults?.string(forKey: "widgetTitle") ?? "OurStory",
            text: defaults?.string(forKey: "widgetText") ?? "Bir hatira sec ve widget yap.",
            meta: defaults?.string(forKey: "widgetMeta") ?? "Ayse & Mert"
        )
    }
}

struct OurStoryWidgetView: View {
    var entry: Provider.Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(entry.title)
                .font(.headline)
                .foregroundStyle(.white)
                .lineLimit(2)
            Text(entry.text)
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.88))
                .lineLimit(4)
            Spacer(minLength: 0)
            Text(entry.meta)
                .font(.caption)
                .foregroundStyle(Color(red: 1.0, green: 0.82, blue: 0.4))
                .lineLimit(1)
        }
        .padding()
        .containerBackground(for: .widget) {
            LinearGradient(
                colors: [Color(red: 0.12, green: 0.02, blue: 0.08), Color(red: 0.36, green: 0.06, blue: 0.16)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }
}

@main
struct OurStoryWidget: Widget {
    let kind: String = "OurStoryWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            OurStoryWidgetView(entry: entry)
        }
        .configurationDisplayName("OurStory")
        .description("Secilen OurStory hatirasini ana ekranda gosterir.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
