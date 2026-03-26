import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class JasperRenderer {

        public static void main(String[] args) throws Exception {

                if (args.length < 4) {
                        System.err.println("Uso:");
                        System.err.println("java JasperRenderer <reporte.jasper> <reportDir> <data.json> <salida.pdf>");
                        System.exit(1);
                }

                String reportPath = args[0];
                String reportDir = args[1];
                String jsonPath = args[2];
                String outputPdf = args[3];

                ObjectMapper mapper = new ObjectMapper();
                List<Map<String, Object>> data = mapper.readValue(
                                new File(jsonPath),
                                mapper.getTypeFactory()
                                                .constructCollectionType(List.class, Map.class));

                JRBeanCollectionDataSource ds = new JRBeanCollectionDataSource(data);

                Map<String, Object> params = new HashMap<>();
                params.put("REPORT_DIR", reportDir);

                JasperPrint print = JasperFillManager.fillReport(
                                reportPath,
                                params,
                                ds);

                byte[] pdf = JasperExportManager.exportReportToPdf(print);
                Files.write(Paths.get(outputPdf), pdf);

                System.out.println("PDF generado correctamente: " + outputPdf);
        }
}
